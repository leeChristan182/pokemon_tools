const express = require("express");
const router = express.Router();
const EditedPokemon = require("../models/EditedPokemon");

// Get all edited Pokemon
router.get("/", (req, res) => {
  try {
    const editedPokemon = EditedPokemon.getAll();
    res.json(editedPokemon);
  } catch (error) {
    console.error("Error fetching edited Pokemon:", error);
    res.status(500).json({ error: "Failed to fetch edited Pokemon" });
  }
});

// Get single edited Pokemon by ID
router.get("/:id", (req, res) => {
  try {
    const pokemonId = parseInt(req.params.id);
    const editedPokemon = EditedPokemon.getById(pokemonId);
    
    if (!editedPokemon) {
      return res.json({ edited: false });
    }
    
    res.json({ edited: true, data: editedPokemon });
  } catch (error) {
    console.error("Error fetching edited Pokemon:", error);
    res.status(500).json({ error: "Failed to fetch edited Pokemon" });
  }
});

// Create or update edited Pokemon
router.post("/", (req, res) => {
  try {
    const result = EditedPokemon.upsert(req.body);
    res.status(201).json({ 
      message: "Pokemon data saved successfully", 
      pokemon_id: req.body.pokemon_id,
      changes: result.changes
    });
  } catch (error) {
    console.error("Error saving edited Pokemon:", error);
    res.status(500).json({ error: "Failed to save edited Pokemon" });
  }
});

// Delete edited Pokemon (revert to API data)
router.delete("/:id", (req, res) => {
  try {
    const pokemonId = parseInt(req.params.id);
    const result = EditedPokemon.delete(pokemonId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "No edited data found for this Pokemon" });
    }
    
    res.json({ message: "Pokemon reverted to API data successfully" });
  } catch (error) {
    console.error("Error deleting edited Pokemon:", error);
    res.status(500).json({ error: "Failed to delete edited Pokemon" });
  }
});

module.exports = router;
