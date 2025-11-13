const express = require("express");
const router = express.Router();
const db = require("../config/database");

// POST /api/pokedoku-games - Save a Pokedoku game
router.post("/", (req, res) => {
  try {
    const { grid_data, guesses_remaining, score, completed } = req.body;

    if (!grid_data) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const stmt = db.prepare(`
      INSERT INTO pokedoku_games (grid_data, guesses_remaining, score, completed)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      grid_data,
      guesses_remaining || 0,
      score || 0,
      completed ? 1 : 0
    );

    res.status(201).json({ 
      id: result.lastInsertRowid,
      grid_data,
      guesses_remaining,
      score,
      completed
    });
  } catch (error) {
    console.error("Error saving Pokedoku game:", error);
    res.status(500).json({ error: "Failed to save Pokedoku game" });
  }
});

// GET /api/pokedoku-games - Get all Pokedoku games
router.get("/", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const stmt = db.prepare(`
      SELECT * FROM pokedoku_games
      ORDER BY created_at DESC
      LIMIT ?
    `);
    const games = stmt.all(limit);
    
    // Parse JSON grid_data
    const parsedGames = games.map(game => ({
      ...game,
      grid_data: JSON.parse(game.grid_data),
      completed: game.completed === 1
    }));
    
    res.json(parsedGames);
  } catch (error) {
    console.error("Error fetching Pokedoku games:", error);
    res.status(500).json({ error: "Failed to fetch Pokedoku games" });
  }
});

// GET /api/pokedoku-games/:id - Get a specific game
router.get("/:id", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM pokedoku_games WHERE id = ?");
    const game = stmt.get(req.params.id);
    
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    
    game.grid_data = JSON.parse(game.grid_data);
    game.completed = game.completed === 1;
    
    res.json(game);
  } catch (error) {
    console.error("Error fetching Pokedoku game:", error);
    res.status(500).json({ error: "Failed to fetch Pokedoku game" });
  }
});

// DELETE /api/pokedoku-games/:id - Delete a game
router.delete("/:id", (req, res) => {
  try {
    const stmt = db.prepare("DELETE FROM pokedoku_games WHERE id = ?");
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Game not found" });
    }
    
    res.json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting Pokedoku game:", error);
    res.status(500).json({ error: "Failed to delete Pokedoku game" });
  }
});

module.exports = router;
