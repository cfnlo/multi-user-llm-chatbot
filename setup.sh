#!/bin/bash

echo "🚀 Setting up Multi-User LLM Chatbot"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js first:"
    echo ""
    echo "Option 1: Download from https://nodejs.org/"
    echo "Option 2: Install via Homebrew (if available):"
    echo "  brew install node"
    echo "Option 3: Install via nvm:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  nvm install node"
    echo ""
    echo "After installing Node.js, run this script again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node --version)"
    echo "Please upgrade Node.js and run this script again."
    exit 1
fi

echo "✅ Node.js $(node --version) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and run this script again."
    exit 1
fi

echo "✅ npm $(npm --version) is installed"

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Install client dependencies
echo ""
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created from env.example"
    echo "⚠️  Please edit .env file and add your OpenAI API key and other configuration"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your OpenAI API key"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see README.md" 