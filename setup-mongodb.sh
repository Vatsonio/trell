#!/bin/bash

echo "Task Management Board Setup Script"
echo "=================================="

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "Docker found. Starting MongoDB container..."
    
    # Check if MongoDB container is already running
    if docker ps | grep -q "mongo"; then
        echo "MongoDB container is already running."
    else
        # Try to start existing container
        if docker ps -a | grep -q "taskboard-mongo"; then
            echo "Starting existing MongoDB container..."
            docker start taskboard-mongo
        else
            # Create and run new MongoDB container
            echo "Creating new MongoDB container..."
            docker run -d \
                --name taskboard-mongo \
                -p 27017:27017 \
                -v taskboard_mongo_data:/data/db \
                mongo:7
        fi
    fi
    
    echo "MongoDB is now running on port 27017"
    echo "You can now start the application with: npm run dev"
    
else
    echo "Docker not found. Please install MongoDB manually:"
    echo ""
    echo "Option 1: Install MongoDB locally"
    echo "  1. Download MongoDB from https://www.mongodb.com/try/download/community"
    echo "  2. Install and start MongoDB service"
    echo "  3. MongoDB will run on mongodb://localhost:27017"
    echo ""
    echo "Option 2: Use MongoDB Atlas (Cloud)"
    echo "  1. Go to https://www.mongodb.com/atlas"
    echo "  2. Create a free cluster"
    echo "  3. Get your connection string"
    echo "  4. Update MONGODB_URI in backend/.env file"
    echo ""
    echo "Option 3: Use Docker"
    echo "  1. Install Docker Desktop"
    echo "  2. Run this script again"
    echo ""
fi
