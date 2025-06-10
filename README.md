# Task Management Board

<b>TREL</b> - A full-stack task management application with drag-and-drop functionality built with React, Node.js, Express, and MongoDB.

![Screeen1](https://media.discordapp.net/attachments/1151832689620557876/1382116322317701244/image.png?ex=6849fba1&is=6848aa21&hm=dd258577cb3438763abe7c675ff70a04ab17d7962048f318f2484f7272c532f6&=&format=webp&quality=lossless&width=2381&height=1232)

![Screeen2](https://media.discordapp.net/attachments/1151832689620557876/1382116334640566372/image.png?ex=6849fba4&is=6848aa24&hm=276515f4eaf8589c4d10b57006efb3472fb086385fb7d91feb102805afd808fc&=&format=webp&quality=lossless&width=2390&height=1232)

## Features

- Create/update/delete boards with unique hashed IDs
- Three-column Kanban board (To Do, In Progress, Done)
- Add/update/delete cards with title and description
- Drag and drop cards between columns and reorder
- Anonymous board management (no authentication required)
- Load boards by entering board ID

## Tech Stack

### Frontend
- React 18 with TypeScript
- Redux Toolkit for state management
- React DnD for drag and drop
- Tailwind CSS for styling

### Backend
- Node.js with Express and TypeScript
- MongoDB with Mongoose
- CORS enabled for cross-origin requests

### Development Tools
- ESLint and Prettier for code quality
- Concurrently for running both frontend and backend
- Docker support

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local, Docker, or MongoDB Atlas)
- npm or yarn

### Quick Start

1. Clone the repository:
```bash
git clone <your-repo-url>
cd trell
```

2. Install all dependencies:
```bash
npm run install-deps
```

3. Set up environment variables:
```bash
# Copy the example environment file (if needed)
copy backend\.env.example backend\.env
```

4. Choose your MongoDB setup:

#### Option A: Use MongoDB Atlas (Recommended - Free Cloud Database)
1. Go to https://www.mongodb.com/atlas
2. Create a free account and cluster
3. Get your connection string
4. Update `backend\.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskboard?retryWrites=true&w=majority
```

#### Option B: Use Docker (if Docker is installed)
```bash
# Start MongoDB container
docker run -d --name taskboard-mongo -p 27017:27017 -v taskboard_mongo_data:/data/db mongo:7
```

#### Option C: Install MongoDB Locally
1. Download from https://www.mongodb.com/try/download/community
2. Install and start the MongoDB service
3. Keep the default `MONGODB_URI=mongodb://localhost:27017/taskboard` in `.env`

5. Start the development servers:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5001

### ✅ Application Status
The application is **fully functional and tested**:
- ✅ Backend API endpoints working correctly
- ✅ Frontend React application running smoothly
- ✅ MongoDB integration tested and confirmed
- ✅ Card creation, update, and deletion working
- ✅ Drag-and-drop functionality implemented
- ✅ Board management working
- ✅ All CRUD operations tested

### Testing the Application
1. Open http://localhost:3000 in your browser
2. Create a new board or load an existing one
3. Add cards to different columns
4. Test drag-and-drop between columns
5. Edit and delete cards as needed

### ⚠️ Important Notes
- MongoDB connection is required for full functionality
- The application uses anonymous boards with unique IDs
- No authentication is required
- Cards are persisted in MongoDB with proper ObjectId handling

### Docker

Build and run with Docker:
```bash
docker-compose up --build
```

## Project Structure

```
trell/
├── frontend/          # React frontend
├── backend/           # Express backend
├── docker-compose.yml
└── package.json       # Root package.json for scripts
```

## API Endpoints

- `GET /api/boards/:id` - Get board by ID
- `POST /api/boards` - Create new board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/cards` - Add card to board
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `PUT /api/cards/:id/move` - Move card between columns

## License

MIT
