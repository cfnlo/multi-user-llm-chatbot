const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { runQuery, getQuery, allQuery } = require('./database');
const { generateRoomSummary } = require('./openai');

function setupRoutes(app) {
  // User registration
  app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Check if user already exists
      const existingUser = await getQuery(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Create user
      await runQuery(
        'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
        [userId, username, email, passwordHash]
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId, username },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: { id: userId, username, email }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // User login
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Find user
      const user = await getQuery(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Get user profile
  app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
      const user = await getQuery(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [req.user.userId]
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  });

  // Create room
  app.post('/api/rooms', authenticateToken, async (req, res) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Room name is required' });
      }

      const roomId = uuidv4();

      // Create room
      await runQuery(
        'INSERT INTO rooms (id, name, description, created_by) VALUES (?, ?, ?, ?)',
        [roomId, name, description, req.user.userId]
      );

      // Add creator as participant
      await runQuery(
        'INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)',
        [roomId, req.user.userId]
      );

      const room = await getQuery(
        'SELECT * FROM rooms WHERE id = ?',
        [roomId]
      );

      res.json({ room });
    } catch (error) {
      console.error('Create room error:', error);
      res.status(500).json({ error: 'Failed to create room' });
    }
  });

  // Get user's rooms
  app.get('/api/rooms', authenticateToken, async (req, res) => {
    try {
      const rooms = await allQuery(`
        SELECT r.*, 
               COUNT(rp.user_id) as participant_count,
               MAX(m.created_at) as last_message_at
        FROM rooms r
        LEFT JOIN room_participants rp ON r.id = rp.room_id
        LEFT JOIN messages m ON r.id = m.room_id
        WHERE r.id IN (
          SELECT room_id FROM room_participants WHERE user_id = ?
        )
        GROUP BY r.id
        ORDER BY last_message_at DESC, r.created_at DESC
      `, [req.user.userId]);

      res.json({ rooms });
    } catch (error) {
      console.error('Get rooms error:', error);
      res.status(500).json({ error: 'Failed to get rooms' });
    }
  });

  // Get room details
  app.get('/api/rooms/:roomId', authenticateToken, async (req, res) => {
    try {
      const { roomId } = req.params;

      // Check if user is participant
      const participant = await getQuery(
        'SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?',
        [roomId, req.user.userId]
      );

      if (!participant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const room = await getQuery(
        'SELECT * FROM rooms WHERE id = ?',
        [roomId]
      );

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      // Get participants
      const participants = await allQuery(`
        SELECT u.id, u.username, u.email, rp.joined_at
        FROM room_participants rp
        JOIN users u ON rp.user_id = u.id
        WHERE rp.room_id = ?
        ORDER BY rp.joined_at ASC
      `, [roomId]);

      res.json({ room, participants });
    } catch (error) {
      console.error('Get room error:', error);
      res.status(500).json({ error: 'Failed to get room' });
    }
  });

  // Invite user to room
  app.post('/api/rooms/:roomId/invite', authenticateToken, async (req, res) => {
    try {
      const { roomId } = req.params;
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      // Check if user is participant
      const participant = await getQuery(
        'SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?',
        [roomId, req.user.userId]
      );

      if (!participant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Find user to invite
      const userToInvite = await getQuery(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (!userToInvite) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Add user to room
      await runQuery(
        'INSERT OR IGNORE INTO room_participants (room_id, user_id) VALUES (?, ?)',
        [roomId, userToInvite.id]
      );

      res.json({ message: 'User invited successfully' });
    } catch (error) {
      console.error('Invite error:', error);
      res.status(500).json({ error: 'Failed to invite user' });
    }
  });

  // Get room messages
  app.get('/api/rooms/:roomId/messages', authenticateToken, async (req, res) => {
    try {
      const { roomId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      // Check if user is participant
      const participant = await getQuery(
        'SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?',
        [roomId, req.user.userId]
      );

      if (!participant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const messages = await allQuery(`
        SELECT m.*, u.username 
        FROM messages m 
        LEFT JOIN users u ON m.user_id = u.id 
        WHERE m.room_id = ? 
        ORDER BY m.created_at DESC 
        LIMIT ? OFFSET ?
      `, [roomId, parseInt(limit), parseInt(offset)]);

      res.json({ messages: messages.reverse() });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  // Generate room summary
  app.post('/api/rooms/:roomId/summary', authenticateToken, async (req, res) => {
    try {
      const { roomId } = req.params;

      // Check if user is participant
      const participant = await getQuery(
        'SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?',
        [roomId, req.user.userId]
      );

      if (!participant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get recent messages
      const messages = await allQuery(`
        SELECT m.*, u.username 
        FROM messages m 
        LEFT JOIN users u ON m.user_id = u.id 
        WHERE m.room_id = ? 
        ORDER BY m.created_at DESC 
        LIMIT 100
      `, [roomId]);

      if (messages.length === 0) {
        return res.json({ summary: 'No messages to summarize.' });
      }

      const summary = await generateRoomSummary(messages);
      res.json({ summary });
    } catch (error) {
      console.error('Summary error:', error);
      res.status(500).json({ error: 'Failed to generate summary' });
    }
  });

  // Invite user by email
  app.post('/api/rooms/:roomId/invite-email', authenticateToken, async (req, res) => {
    try {
      const { roomId } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user is participant
      const participant = await getQuery(
        'SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?',
        [roomId, req.user.userId]
      );

      if (!participant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get room details
      const room = await getQuery(
        'SELECT * FROM rooms WHERE id = ?',
        [roomId]
      );

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex');
      const invitationId = uuidv4();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create invitation
      await runQuery(
        'INSERT INTO invitations (id, room_id, email, invited_by, token, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
        [invitationId, roomId, email, req.user.userId, token, expiresAt.toISOString()]
      );

      // Generate invitation URL
      const baseUrl = process.env.CLIENT_URL || 
        (process.env.NODE_ENV === 'production' 
          ? process.env.RAILWAY_STATIC_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
          : 'http://localhost:3000');
      const invitationUrl = `${baseUrl}/join/${token}`;

      res.json({ 
        message: 'Invitation created successfully',
        invitationUrl,
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      console.error('Invite email error:', error);
      res.status(500).json({ error: 'Failed to create invitation' });
    }
  });

  // Get invitation details
  app.get('/api/invitations/:token', async (req, res) => {
    try {
      const { token } = req.params;

      const invitation = await getQuery(`
        SELECT i.*, r.name as room_name, r.description as room_description, u.username as invited_by_username
        FROM invitations i
        JOIN rooms r ON i.room_id = r.id
        JOIN users u ON i.invited_by = u.id
        WHERE i.token = ? AND i.used = FALSE AND i.expires_at > datetime('now')
      `, [token]);

      if (!invitation) {
        return res.status(404).json({ error: 'Invalid or expired invitation' });
      }

      res.json({ invitation });
    } catch (error) {
      console.error('Get invitation error:', error);
      res.status(500).json({ error: 'Failed to get invitation' });
    }
  });

  // Accept invitation
  app.post('/api/invitations/:token/accept', async (req, res) => {
    try {
      const { token } = req.params;
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Get invitation
      const invitation = await getQuery(`
        SELECT * FROM invitations 
        WHERE token = ? AND used = FALSE AND expires_at > datetime('now')
      `, [token]);

      if (!invitation) {
        return res.status(404).json({ error: 'Invalid or expired invitation' });
      }

      // Check if user already exists
      const existingUser = await getQuery(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, invitation.email]
      );

      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Create user
      const userId = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);

      await runQuery(
        'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
        [userId, username, invitation.email, passwordHash]
      );

      // Add user to room
      await runQuery(
        'INSERT OR IGNORE INTO room_participants (room_id, user_id) VALUES (?, ?)',
        [invitation.room_id, userId]
      );

      // Mark invitation as used
      await runQuery(
        'UPDATE invitations SET used = TRUE WHERE token = ?',
        [token]
      );

      // Generate JWT token
      const jwtToken = jwt.sign(
        { userId, username },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      res.json({
        token: jwtToken,
        user: { id: userId, username, email: invitation.email },
        roomId: invitation.room_id
      });
    } catch (error) {
      console.error('Accept invitation error:', error);
      res.status(500).json({ error: 'Failed to accept invitation' });
    }
  });

  // Get pending invitations for a room
  app.get('/api/rooms/:roomId/invitations', authenticateToken, async (req, res) => {
    try {
      const { roomId } = req.params;

      // Check if user is participant
      const participant = await getQuery(
        'SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?',
        [roomId, req.user.userId]
      );

      if (!participant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const invitations = await allQuery(`
        SELECT i.*, u.username as invited_by_username
        FROM invitations i
        JOIN users u ON i.invited_by = u.id
        WHERE i.room_id = ? AND i.used = FALSE AND i.expires_at > datetime('now')
        ORDER BY i.created_at DESC
      `, [roomId]);

      res.json({ invitations });
    } catch (error) {
      console.error('Get invitations error:', error);
      res.status(500).json({ error: 'Failed to get invitations' });
    }
  });
}

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

module.exports = {
  setupRoutes
}; 