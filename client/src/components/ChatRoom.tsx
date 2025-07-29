import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { 
  ArrowLeft, 
  Send, 
  Users, 
  UserPlus, 
  FileText,
  Bot,
  User as UserIcon
} from 'lucide-react';
import InviteModal from './InviteModal';

interface Message {
  id: string;
  content: string;
  username: string;
  message_type: 'user' | 'ai';
  created_at: string;
  user_id?: string;
}

interface Participant {
  id: string;
  username: string;
  email: string;
  joined_at: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!roomId || !user) return;

    // Initialize socket connection
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Join room
    newSocket.emit('join_room', {
      roomId,
      userId: user.id,
      username: user.username
    });

    // Fetch room details
    fetchRoomDetails();

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, user]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for room messages (history)
    socket.on('room_messages', (messages: Message[]) => {
      setMessages(messages);
      setLoading(false);
    });

    // Listen for user join/leave events
    socket.on('user_joined', (data: { username: string; userId: string }) => {
      // You could add a system message here
    });

    socket.on('user_left', (data: { username: string; userId: string }) => {
      // You could add a system message here
    });

    // Listen for typing indicators
    socket.on('user_typing', (data: { username: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return [...prev.filter(u => u !== data.username), data.username];
        } else {
          return prev.filter(u => u !== data.username);
        }
      });
    });

    return () => {
      socket.off('new_message');
      socket.off('room_messages');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('user_typing');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRoomDetails = async () => {
    try {
      const response = await axios.get(`/api/rooms/${roomId}`);
      setRoom(response.data.room);
      setParticipants(response.data.participants);
    } catch (error) {
      console.error('Failed to fetch room details:', error);
      navigate('/');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    socket.emit('send_message', {
      roomId,
      content: newMessage,
      userId: user.id,
      username: user.username
    });

    setNewMessage('');
    
    // Stop typing indicator
    socket.emit('typing', {
      roomId,
      username: user.username,
      isTyping: false
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!socket || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing indicator
    socket.emit('typing', {
      roomId,
      username: user.username,
      isTyping: true
    });

    // Stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        roomId,
        username: user.username,
        isTyping: false
      });
    }, 2000);
  };



  const generateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const response = await axios.post(`/api/rooms/${roomId}/summary`);
      setSummary(response.data.summary);
      setShowSummary(true);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {room?.name}
                </h1>
                {room?.description && (
                  <p className="text-sm text-gray-500">{room.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Users className="h-5 w-5" />
                <span>{participants.length}</span>
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <UserPlus className="h-5 w-5" />
                <span>Invite</span>
              </button>
              <button
                onClick={generateSummary}
                disabled={generatingSummary}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <FileText className="h-5 w-5" />
                <span>{generatingSummary ? 'Generating...' : 'Summary'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.message_type === 'ai'
                      ? 'bg-blue-100 text-blue-900'
                      : message.user_id === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.message_type === 'ai' ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {message.username}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="typing-indicator">
                    <span className="text-sm text-gray-600">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                    </span>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Participants ({participants.length})
            </h3>
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {participant.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(participant.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        roomId={roomId || ''}
        roomName={room?.name || ''}
      />

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Conversation Summary
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {summary}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom; 