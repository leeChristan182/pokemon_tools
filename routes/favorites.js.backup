const express = require("express");
const router = express.Router();
const FavoritePokemon = require("../models/FavoritePokemon");

// POST /api/favorites - Add a favorite Pokemon
router.post("/", (req, res) => {
  try {
    const { user_id, pokemon_id, pokemon_name } = req.body;

    if (!user_id || !pokemon_id || !pokemon_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const favorite = FavoritePokemon.add(user_id, pokemon_id, pokemon_name);
    
    if (!favorite) {
      return res.status(409).json({ error: "Pokemon already in favorites" });
    }

    res.status(201).json(favorite);
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// GET /api/favorites/user/:userId/count - Get favorite count
router.get("/user/:userId/count", (req, res) => {
  try {
    const count = FavoritePokemon.getCount(req.params.userId);
    res.json({ count });
  } catch (error) {
    console.error("Error getting favorite count:", error);
    res.status(500).json({ error: "Failed to get favorite count" });
  }
});

// GET /api/favorites/user/:userId/check/:pokemonId - Check if Pokemon is favorited
router.get("/user/:userId/check/:pokemonId", (req, res) => {
  try {
    const isFavorite = FavoritePokemon.isFavorite(
      req.params.userId,
      req.params.pokemonId
    );
    res.json({ isFavorite });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({ error: "Failed to check favorite" });
  }
});

// GET /api/favorites/user/:userId - Get all favorites for a user
router.get("/user/:userId", (req, res) => {
  try {
    const favorites = FavoritePokemon.getByUser(req.params.userId);
    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// DELETE /api/favorites/:userId/:pokemonId - Remove a favorite
router.delete("/:userId/:pokemonId", (req, res) => {
  try {
    const result = FavoritePokemon.remove(
      req.params.userId,
      req.params.pokemonId
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    res.json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

module.exports = router;
