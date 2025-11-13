const express = require("express");
const router = express.Router();
const EditedMove = require("../models/EditedMove");

// Get all edited moves
router.get("/", (req, res) => {
  try {
    const editedMoves = EditedMove.getAll();
    res.json(editedMoves);
  } catch (error) {
    console.error("Error fetching edited moves:", error);
    res.status(500).json({ error: "Failed to fetch edited moves" });
  }
});

// Get single edited move by name
router.get("/:name", (req, res) => {
  try {
    const moveName = req.params.name.toLowerCase();
    const editedMove = EditedMove.getByName(moveName);
    
    if (!editedMove) {
      return res.json({ edited: false });
    }
    
    res.json({ edited: true, data: editedMove });
  } catch (error) {
    console.error("Error fetching edited move:", error);
    res.status(500).json({ error: "Failed to fetch edited move" });
  }
});

// Create or update edited move
router.post("/", (req, res) => {
  try {
    const result = EditedMove.upsert(req.body);
    res.status(201).json({ 
      message: "Move data saved successfully", 
      move_name: req.body.move_name,
      changes: result.changes
    });
  } catch (error) {
    console.error("Error saving edited move:", error);
    res.status(500).json({ error: "Failed to save edited move" });
  }
});

// Delete edited move (revert to API data)
router.delete("/:name", (req, res) => {
  try {
    const moveName = req.params.name.toLowerCase();
    const result = EditedMove.delete(moveName);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "No edited data found for this move" });
    }
    
    res.json({ message: "Move reverted to API data successfully" });
  } catch (error) {
    console.error("Error deleting edited move:", error);
    res.status(500).json({ error: "Failed to delete edited move" });
  }
});

module.exports = router;
