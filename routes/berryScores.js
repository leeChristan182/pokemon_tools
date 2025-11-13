const express = require("express");
const router = express.Router();
const BerryGameScore = require("../models/BerryGameScore");

// POST /api/berry-scores - Create a new berry game score
router.post("/", (req, res) => {
  try {
    const { player_name, score, moves, time_seconds } = req.body;

    if (!player_name || score === undefined || !moves) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newScore = BerryGameScore.create({
      player_name,
      score,
      moves,
      time_seconds,
    });

    res.status(201).json(newScore);
  } catch (error) {
    console.error("Error creating berry game score:", error);
    res.status(500).json({ error: "Failed to save berry game score" });
  }
});

// GET /api/berry-scores - Get all berry game scores
router.get("/", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const scores = BerryGameScore.getAll(limit);
    res.json(scores);
  } catch (error) {
    console.error("Error fetching berry game scores:", error);
    res.status(500).json({ error: "Failed to fetch berry game scores" });
  }
});

// GET /api/berry-scores/leaderboard - Get leaderboard
router.get("/leaderboard", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = BerryGameScore.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// GET /api/berry-scores/player/:name - Get scores by player name
router.get("/player/:name", (req, res) => {
  try {
    const scores = BerryGameScore.getByPlayer(req.params.name);
    res.json(scores);
  } catch (error) {
    console.error("Error fetching player scores:", error);
    res.status(500).json({ error: "Failed to fetch player scores" });
  }
});

// DELETE /api/berry-scores/:id - Delete a berry game score
router.delete("/:id", (req, res) => {
  try {
    const result = BerryGameScore.delete(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Score not found" });
    }
    res.json({ message: "Score deleted successfully" });
  } catch (error) {
    console.error("Error deleting berry game score:", error);
    res.status(500).json({ error: "Failed to delete berry game score" });
  }
});

module.exports = router;
