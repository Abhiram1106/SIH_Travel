#!/bin/bash

# Smart Travel App Setup Script
echo "🌍 Setting up Smart Travel App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

# Check if MongoDB is running (optional check)
# if ! pgrep -x "mongod" > /dev/null; then
#     echo "⚠️  MongoDB is not running. Please start MongoDB or use MongoDB Atlas."
# fi

echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual configuration values"
fi

echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "   npm start                 # Start both client and server"
echo "   npm run server           # Start only server"
echo "   npm run client           # Start only client"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000/api"
echo "   Health:   http://localhost:5000/api/health"
echo ""
echo "📚 Check README.md for detailed documentation"
