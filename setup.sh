#!/bin/bash

echo "🚀 Setting up Student Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="mongodb+srv://student_management:181203@studentcluster.9vpf4zh.mongodb.net/?retryWrites=true&w=majority&appName=StudentCluster"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Google OAuth (you'll need to add these from Google Cloud Console)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
EOF
    echo "✅ .env file created"
    echo "⚠️  Please update the .env file with your Google OAuth credentials"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your Google OAuth credentials"
echo "2. Start MongoDB (if using local database)"
echo "3. Run 'npm run db:push' to set up the database"
echo "4. Run 'npm run db:seed' to populate with sample data"
echo "5. Run 'npm run dev' to start the development server"
echo ""
echo "For more information, see README.md" 