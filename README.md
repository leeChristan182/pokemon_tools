# Pokemon Tools

A full-stack Pokemon application with interactive games, Pokedex, and Itemdex features.

## Features

- **Pokedex**: Browse and view detailed Pokemon information with custom editing capabilities
- **Itemdex**: Explore Pokemon items with customizable descriptions
- **Games**:
  - Berry Memory Game
  - Pokemon Quiz
  - Pokedoku (Pokemon Sudoku)
- **Custom Editing**: Edit and personalize Pokemon and item data
- **Database Storage**: Persistent storage for scores and custom data

## Tech Stack

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- RESTful API

### Frontend
- Vue 3 (Composition API)
- Vue Router
- Vite
- Axios

## Setup

### Backend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start
```

Server runs on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Pokemon
- `GET /api/pokemon/:id` - Get Pokemon with edited data
- `GET /api/edited-pokemon` - Get all edited Pokemon
- `POST /api/edited-pokemon` - Create/update edited Pokemon
- `DELETE /api/edited-pokemon/:id` - Revert to original data

### Items
- `GET /api/item/:id` - Get item with edited data
- `GET /api/edited-items` - Get all edited items
- `POST /api/edited-items` - Create/update edited item
- `DELETE /api/edited-items/:id` - Revert to original data

### Moves
- `GET /api/move/:name` - Get move with edited data
- `GET /api/edited-moves` - Get all edited moves
- `POST /api/edited-moves` - Create/update edited move
- `DELETE /api/edited-moves/:name` - Revert to original data

### Scores
- `POST /api/quiz-scores` - Save quiz score
- `GET /api/quiz-scores/leaderboard` - Get quiz leaderboard
- `POST /api/berry-scores` - Save berry game score
- `GET /api/berry-scores/leaderboard` - Get berry game leaderboard
- `POST /api/pokedoku-games` - Save Pokedoku game

## Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend (will serve built frontend)
cd ..
npm start
```

The production server will serve the built frontend at `http://localhost:5000`

## Database

SQLite database (`pokemon_tools.db`) is automatically initialized on first run with tables for:
- Quiz scores
- Berry game scores
- Pokedoku games
- Edited Pokemon data
- Edited items data
- Edited moves data

## License

ISC
