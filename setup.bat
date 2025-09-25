@echo off
echo 🌍 Setting up Smart Travel App...

:: Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo 📦 Installing dependencies...

:: Install root dependencies
echo Installing root dependencies...
call npm install

:: Install server dependencies
echo Installing server dependencies...
cd server
call npm install
cd ..

:: Install client dependencies
echo Installing client dependencies...
cd client
call npm install
cd ..

:: Copy environment file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating environment file...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your actual configuration values
)

echo ✅ Setup completed successfully!
echo.
echo 🚀 To start the application:
echo    npm start                 # Start both client and server
echo    npm run server           # Start only server
echo    npm run client           # Start only client
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000/api
echo    Health:   http://localhost:5000/api/health
echo.
echo 📚 Check README.md for detailed documentation
pause
