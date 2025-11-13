const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Initialize database
require("./config/database");

// Import routes
const quizScoresRouter = require("./routes/quizScores");
const berryScoresRouter = require("./routes/berryScores");
const pokedokuRouter = require("./routes/pokedoku");
const adminRouter = require("./routes/admin");
const editedPokemonRouter = require("./routes/editedPokemon");
const editedItemsRouter = require("./routes/editedItems");
const editedMovesRouter = require("./routes/editedMoves");
const pokemonRouter = require("./routes/pokemon");
const itemsRouter = require("./routes/items");
const movesRouter = require("./routes/moves");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/quiz-scores", quizScoresRouter);
app.use("/api/berry-scores", berryScoresRouter);
app.use("/api/pokedoku-games", pokedokuRouter);
app.use("/api/admin", adminRouter);
app.use("/api/edited-pokemon", editedPokemonRouter);
app.use("/api/edited-items", editedItemsRouter);
app.use("/api/edited-moves", editedMovesRouter);
app.use("/api/pokemon", pokemonRouter);
app.use("/api/item", itemsRouter);
app.use("/api/move", movesRouter);

// --- Serve the built Vue frontend (production mode only) ---
const __dirnamePath = path.resolve();
const distPath = path.join(__dirnamePath, "frontend/dist");
const fs = require("fs");

// Check if dist folder exists (production build)
const distExists = fs.existsSync(distPath);

if (distExists) {
  // Serve static files from frontend/dist
  app.use(express.static(distPath));
}

// Example API route
app.get("/api", (req, res) => {
  res.json({ 
    message: "Hello from Express backend API!",
    mode: distExists ? "production" : "development",
    note: distExists ? "Serving built frontend" : "Run 'npm run build' in frontend folder to build the frontend"
  });
});

// Handle all other routes (for Vue Router SPA) - only in production
if (distExists) {
  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.use((req, res) => {
    res.json({
      message: "Backend API is running in development mode",
      instructions: [
        "1. Run your Vue frontend separately: cd frontend && npm run dev",
        "2. The frontend will run on http://localhost:5173 (Vite default)",
        "3. Backend API is available at http://localhost:5000/api/*",
        "4. To build for production: cd frontend && npm run build"
      ],
      availableEndpoints: [
        "GET  /api - This info",
        "POST /api/quiz-scores - Save quiz score",
        "GET  /api/quiz-scores - Get quiz scores",
        "GET  /api/quiz-scores/leaderboard - Get leaderboard",
        "POST /api/berry-scores - Save berry game score",
        "GET  /api/berry-scores - Get berry game scores",
        "POST /api/teams - Save Pokemon team",
        "GET  /api/teams - Get all teams",
        "GET  /api/teams/:id - Get single team",
        "PUT  /api/teams/:id - Update team",
        "DELETE /api/teams/:id - Delete team",
        "POST /api/favorites - Add favorite",
        "GET  /api/favorites/user/:userId - Get favorites",
        "DELETE /api/favorites/:userId/:pokemonId - Remove favorite"
      ]
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
