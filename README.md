# Multi-User LLM Chatbot

A real-time multi-user chatbot application with AI integration, built with React, Node.js, Socket.IO, and OpenAI.

## Features

- 🔐 **User Authentication** - Secure login/registration with JWT
- 👥 **Multi-User Chat Rooms** - Create and join chat rooms with multiple participants
- 🤖 **AI Integration** - OpenAI-powered chatbot responses
- 💬 **Real-Time Messaging** - Instant message delivery with Socket.IO
- 📱 **Modern UI** - Beautiful, responsive interface with Tailwind CSS
- 👤 **User Management** - Invite users to rooms, view participants
- 📝 **Conversation Summary** - AI-generated summaries of chat conversations
- ⌨️ **Typing Indicators** - See when users are typing
- 📊 **Message History** - Persistent message storage with SQLite

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **SQLite** - Database
- **OpenAI API** - AI chatbot integration
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd llm-chatbot-multi-user
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_here
   
   # Database
   DATABASE_PATH=./chatbot.db
   ```

## Running the Application

### Development Mode

Run both server and client simultaneously:
```bash
npm run dev
```

Or run them separately:

**Server (Terminal 1):**
```bash
npm run server
```

**Client (Terminal 2):**
```bash
npm run client
```

### Production Mode

1. **Build the client:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

## Usage

1. **Register/Login** - Create an account or sign in
2. **Create Rooms** - Create new chat rooms from the dashboard
3. **Join Rooms** - Click on any room to join the conversation
4. **Invite Users** - Invite other users to your rooms
5. **Chat with AI** - The AI assistant will respond to messages in real-time
6. **Generate Summaries** - Get AI-generated summaries of conversations

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Rooms
- `GET /api/rooms` - Get user's rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:roomId` - Get room details
- `POST /api/rooms/:roomId/invite` - Invite user to room
- `GET /api/rooms/:roomId/messages` - Get room messages
- `POST /api/rooms/:roomId/summary` - Generate conversation summary

## Socket.IO Events

### Client to Server
- `join_room` - Join a chat room
- `send_message` - Send a message
- `leave_room` - Leave a chat room
- `typing` - Typing indicator

### Server to Client
- `new_message` - New message received
- `room_messages` - Room message history
- `user_joined` - User joined room
- `user_left` - User left room
- `user_typing` - User typing indicator

## Database Schema

### Users
- `id` (TEXT, PRIMARY KEY)
- `username` (TEXT, UNIQUE)
- `email` (TEXT, UNIQUE)
- `password_hash` (TEXT)
- `created_at` (DATETIME)

### Rooms
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT)
- `description` (TEXT)
- `created_by` (TEXT, FOREIGN KEY)
- `created_at` (DATETIME)

### Room Participants
- `room_id` (TEXT, FOREIGN KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `joined_at` (DATETIME)

### Messages
- `id` (TEXT, PRIMARY KEY)
- `room_id` (TEXT, FOREIGN KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `content` (TEXT)
- `message_type` (TEXT) - 'user' or 'ai'
- `created_at` (DATETIME)

## Project Structure

```
├── server/
│   ├── index.js          # Main server file
│   ├── database.js       # Database setup and helpers
│   ├── openai.js         # OpenAI integration
│   ├── socketHandlers.js # Socket.IO event handlers
│   └── routes.js         # REST API routes
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── App.tsx       # Main app component
│   │   └── index.tsx     # App entry point
│   ├── package.json
│   └── tailwind.config.js
├── package.json
├── env.example
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Acknowledgments

- OpenAI for providing the AI API
- Socket.IO for real-time communication
- Tailwind CSS for the beautiful UI components
 