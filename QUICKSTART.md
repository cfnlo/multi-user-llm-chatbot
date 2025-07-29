# Quick Start Guide

Get your Multi-User LLM Chatbot running in minutes!

## Prerequisites

Before you start, make sure you have:
- Node.js (v16 or higher) installed
- An OpenAI API key

## Installation

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

2. **Configure your environment:**
   ```bash
   # Edit the .env file
   nano .env
   ```
   
   Add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

This will start both the server (port 3001) and client (port 3000).

### Production Mode
```bash
npm run build
npm start
```

## First Steps

1. **Open your browser** and go to `http://localhost:3000`
2. **Register** a new account or **login** if you already have one
3. **Create a chat room** from the dashboard
4. **Invite friends** by their username
5. **Start chatting** - the AI will respond to your messages!

## Features to Try

- ✅ **Real-time messaging** - Messages appear instantly
- ✅ **AI responses** - The chatbot responds to every message
- ✅ **User invitations** - Invite others to your rooms
- ✅ **Typing indicators** - See when others are typing
- ✅ **Conversation summaries** - Get AI-generated summaries
- ✅ **Multiple rooms** - Create different chat rooms for different topics

## Troubleshooting

### "Node.js not found"
- Install Node.js from https://nodejs.org/
- Or use: `brew install node` (macOS with Homebrew)

### "OpenAI API error"
- Check your API key in the `.env` file
- Make sure you have credits in your OpenAI account

### "Port already in use"
- Change the port in `.env`: `PORT=3002`
- Or kill the process using the port

### "Database error"
- The SQLite database will be created automatically
- Check file permissions in the project directory

## Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Open an issue on GitHub if you encounter problems
- The application logs will show in the terminal where you ran `npm run dev`

## Next Steps

- Customize the AI behavior in `server/openai.js`
- Add more features like file sharing or voice messages
- Deploy to a cloud platform like Heroku or Vercel
- Add more AI models or integrations 