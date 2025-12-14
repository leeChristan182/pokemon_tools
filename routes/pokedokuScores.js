const express = require("express");
const router = express.Router();
const PokedokuScore = require("../models/PokedokuScore");

// POST /api/pokedoku-scores - Create a new score
router.post("/", (req, res) => {
  try {
    const { player_name, moves_used, correct_answers, puzzle_difficulty } = req.body;

    if (!player_name || moves_used === undefined || correct_answers === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const score = PokedokuScore.create({
      player_name,
      moves_used,
      correct_answers,
      puzzle_difficulty: puzzle_difficulty || 'normal'
    });

    res.status(201).json(score);
  } catch (error) {
    console.error("Error creating pokedoku score:", error);
    res.status(500).json({ error: "Failed to create pokedoku score" });
  }
});

// GET /api/pokedoku-scores - Get all scores
router.get("/", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const scores = PokedokuScore.getAll(limit);
    res.json(scores);
  } catch (error) {
    console.error("Error fetching pokedoku scores:", error);
    res.status(500).json({ error: "Failed to fetch pokedoku scores" });
  }
});

// GET /api/pokedoku-scores/leaderboard - Get leaderboard
router.get("/leaderboard", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = PokedokuScore.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching pokedoku leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch pokedoku leaderboard" });
  }
});

// GET /api/pokedoku-scores/player/:name - Get scores for a specific player
router.get("/player/:name", (req, res) => {
  try {
    const scores = PokedokuScore.getByPlayer(req.params.name);
    res.json(scores);
  } catch (error) {
    console.error("Error fetching player scores:", error);
    res.status(500).json({ error: "Failed to fetch player scores" });
  }
});

module.exports = router;
