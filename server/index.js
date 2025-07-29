const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./database');
const { setupSocketHandlers } = require('./socketHandlers');
const { setupRoutes } = require('./routes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Initialize database
initializeDatabase();

// Setup routes
setupRoutes(app);

// Setup socket handlers
setupSocketHandlers(io);

// Serve React app for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
}); 