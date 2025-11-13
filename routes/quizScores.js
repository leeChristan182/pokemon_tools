const express = require("express");
const router = express.Router();
const QuizScore = require("../models/QuizScore");

// POST /api/quiz-scores - Create a new quiz score
router.post("/", (req, res) => {
  try {
    const { player_name, score, total_questions, quiz_type } = req.body;

    if (!player_name || score === undefined || !total_questions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newScore = QuizScore.create({
      player_name,
      score,
      total_questions,
      quiz_type,
    });

    res.status(201).json(newScore);
  } catch (error) {
    console.error("Error creating quiz score:", error);
    res.status(500).json({ error: "Failed to save quiz score" });
  }
});

// GET /api/quiz-scores - Get all quiz scores
router.get("/", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const quizType = req.query.quiz_type || null;

    const scores = QuizScore.getAll(limit, quizType);
    res.json(scores);
  } catch (error) {
    console.error("Error fetching quiz scores:", error);
    res.status(500).json({ error: "Failed to fetch quiz scores" });
  }
});

// GET /api/quiz-scores/leaderboard - Get leaderboard
router.get("/leaderboard", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = QuizScore.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// GET /api/quiz-scores/player/:name - Get scores by player name
router.get("/player/:name", (req, res) => {
  try {
    const scores = QuizScore.getByPlayer(req.params.name);
    res.json(scores);
  } catch (error) {
    console.error("Error fetching player scores:", error);
    res.status(500).json({ error: "Failed to fetch player scores" });
  }
});

// DELETE /api/quiz-scores/:id - Delete a quiz score
router.delete("/:id", (req, res) => {
  try {
    const result = QuizScore.delete(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Score not found" });
    }
    res.json({ message: "Score deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz score:", error);
    res.status(500).json({ error: "Failed to delete quiz score" });
  }
});

module.exports = router;
