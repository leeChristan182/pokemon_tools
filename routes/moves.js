const express = require("express");
const router = express.Router();
const axios = require("axios");
const EditedMove = require("../models/EditedMove");

// Proxy endpoint to fetch Move with edited data merged
router.get("/:name", async (req, res) => {
  try {
    const moveName = req.params.name.toLowerCase();
    
    // Fetch from PokeAPI
    const apiResponse = await axios.get(`https://pokeapi.co/api/v2/move/${moveName}`);
    const moveData = apiResponse.data;
    
    // Check if there's edited data for this move
    const editedData = EditedMove.getByName(moveName);
    
    // Build the response with merged data
    const response = {
      ...moveData,
      edited: !!editedData,
      custom_data: editedData ? {
        flavor_text: editedData.flavor_text,
        custom_notes: editedData.custom_notes,
        edited_at: editedData.edited_at,
        updated_at: editedData.updated_at
      } : null
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error fetching move:", error);
    if (error.response?.status === 404) {
      res.status(404).json({ error: "Move not found" });
    } else {
      res.status(500).json({ error: "Failed to fetch move data" });
    }
  }
});

module.exports = router;
