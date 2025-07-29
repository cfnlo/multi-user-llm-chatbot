const { v4: uuidv4 } = require('uuid');
const { runQuery, getQuery, allQuery } = require('./database');
const { generateResponse } = require('./openai');

const connectedUsers = new Map(); // socketId -> userInfo
const roomParticipants = new Map(); // roomId -> Set of socketIds

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join_room', async (data) => {
      const { roomId, userId, username } = data;
      
      try {
        // Add user to room participants in database
        await runQuery(
          'INSERT OR IGNORE INTO room_participants (room_id, user_id) VALUES (?, ?)',
          [roomId, userId]
        );

        // Store user info
        connectedUsers.set(socket.id, { userId, username, roomId });
        
        // Add to room participants set
        if (!roomParticipants.has(roomId)) {
          roomParticipants.set(roomId, new Set());
        }
        roomParticipants.get(roomId).add(socket.id);

        // Join socket room
        socket.join(roomId);

        // Get recent messages
        const messages = await allQuery(`
          SELECT m.*, u.username 
          FROM messages m 
          LEFT JOIN users u ON m.user_id = u.id 
          WHERE m.room_id = ? 
          ORDER BY m.created_at DESC 
          LIMIT 50
        `, [roomId]);

        // Send recent messages to user
        socket.emit('room_messages', messages.reverse());

        // Notify others in room
        socket.to(roomId).emit('user_joined', { username, userId });

        console.log(`${username} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', 'Failed to join room');
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      const { roomId, content, userId, username } = data;
      const messageId = uuidv4();
      
      try {
        // Save user message to database
        await runQuery(
          'INSERT INTO messages (id, room_id, user_id, content, message_type) VALUES (?, ?, ?, ?, ?)',
          [messageId, roomId, userId, content, 'user']
        );

        const userMessage = {
          id: messageId,
          room_id: roomId,
          user_id: userId,
          content,
          message_type: 'user',
          username,
          created_at: new Date().toISOString()
        };

        // Broadcast user message to room
        io.to(roomId).emit('new_message', userMessage);

        // Generate AI response
        const recentMessages = await allQuery(`
          SELECT m.*, u.username 
          FROM messages m 
          LEFT JOIN users u ON m.user_id = u.id 
          WHERE m.room_id = ? 
          ORDER BY m.created_at DESC 
          LIMIT 10
        `, [roomId]);

        const aiMessages = recentMessages.reverse().map(msg => ({
          role: msg.message_type === 'ai' ? 'assistant' : 'user',
          content: msg.content
        }));

        const aiResponse = await generateResponse(aiMessages);
        const aiMessageId = uuidv4();

        // Save AI response to database
        await runQuery(
          'INSERT INTO messages (id, room_id, content, message_type) VALUES (?, ?, ?, ?)',
          [aiMessageId, roomId, aiResponse, 'ai']
        );

        const aiMessage = {
          id: aiMessageId,
          room_id: roomId,
          content: aiResponse,
          message_type: 'ai',
          username: 'AI Assistant',
          created_at: new Date().toISOString()
        };

        // Broadcast AI response to room
        io.to(roomId).emit('new_message', aiMessage);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Leave room
    socket.on('leave_room', (data) => {
      const { roomId } = data;
      const userInfo = connectedUsers.get(socket.id);
      
      if (userInfo) {
        socket.to(roomId).emit('user_left', { 
          username: userInfo.username, 
          userId: userInfo.userId 
        });
      }

      socket.leave(roomId);
      
      // Remove from room participants
      if (roomParticipants.has(roomId)) {
        roomParticipants.get(roomId).delete(socket.id);
        if (roomParticipants.get(roomId).size === 0) {
          roomParticipants.delete(roomId);
        }
      }

      console.log(`User left room ${roomId}`);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { roomId, username, isTyping } = data;
      socket.to(roomId).emit('user_typing', { username, isTyping });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userInfo = connectedUsers.get(socket.id);
      
      if (userInfo) {
        const { roomId, username, userId } = userInfo;
        
        // Notify others in room
        socket.to(roomId).emit('user_left', { username, userId });
        
        // Remove from room participants
        if (roomParticipants.has(roomId)) {
          roomParticipants.get(roomId).delete(socket.id);
          if (roomParticipants.get(roomId).size === 0) {
            roomParticipants.delete(roomId);
          }
        }
        
        connectedUsers.delete(socket.id);
      }

      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = {
  setupSocketHandlers
}; 