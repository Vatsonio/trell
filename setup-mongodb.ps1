# Task Management Board Setup Script for Windows
# ==============================================

Write-Host "Task Management Board Setup Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if Docker is available
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "Docker found. Starting MongoDB container..." -ForegroundColor Yellow
        
        # Check if MongoDB container is already running
        $runningContainers = docker ps --format "table {{.Names}}" 2>$null
        if ($runningContainers -match "taskboard-mongo") {
            Write-Host "MongoDB container is already running." -ForegroundColor Green
        } else {
            # Try to start existing container
            $allContainers = docker ps -a --format "table {{.Names}}" 2>$null
            if ($allContainers -match "taskboard-mongo") {
                Write-Host "Starting existing MongoDB container..." -ForegroundColor Yellow
                docker start taskboard-mongo
            } else {
                # Create and run new MongoDB container
                Write-Host "Creating new MongoDB container..." -ForegroundColor Yellow
                docker run -d `
                    --name taskboard-mongo `
                    -p 27017:27017 `
                    -v taskboard_mongo_data:/data/db `
                    mongo:7
            }
        }
        
        Write-Host "MongoDB is now running on port 27017" -ForegroundColor Green
        Write-Host "You can now start the application with: npm run dev" -ForegroundColor Green
        
    }
} catch {
    Write-Host "Docker not found. Please install MongoDB manually:" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1: Install MongoDB locally" -ForegroundColor Cyan
    Write-Host "  1. Download MongoDB from https://www.mongodb.com/try/download/community"
    Write-Host "  2. Install and start MongoDB service"
    Write-Host "  3. MongoDB will run on mongodb://localhost:27017"
    Write-Host ""
    Write-Host "Option 2: Use MongoDB Atlas (Cloud)" -ForegroundColor Cyan
    Write-Host "  1. Go to https://www.mongodb.com/atlas"
    Write-Host "  2. Create a free cluster"
    Write-Host "  3. Get your connection string"
    Write-Host "  4. Update MONGODB_URI in backend/.env file"
    Write-Host ""
    Write-Host "Option 3: Use Docker" -ForegroundColor Cyan
    Write-Host "  1. Install Docker Desktop"
    Write-Host "  2. Run this script again"
    Write-Host ""
    Write-Host "For now, the application will work without MongoDB (limited functionality)" -ForegroundColor Yellow
}
