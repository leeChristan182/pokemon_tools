const express = require("express");
const router = express.Router();
const PokemonTeam = require("../models/PokemonTeam");

// POST /api/teams - Create a new team
router.post("/", (req, res) => {
  try {
    const { team_name, pokemon_data } = req.body;

    if (!team_name || !pokemon_data) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTeam = PokemonTeam.create({
      team_name,
      pokemon_data,
    });

    res.status(201).json(newTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Failed to save team" });
  }
});

// GET /api/teams - Get all teams
router.get("/", (req, res) => {
  try {
    const teams = PokemonTeam.getAll();
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// GET /api/teams/:id - Get a specific team
router.get("/:id", (req, res) => {
  try {
    const team = PokemonTeam.getById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

// PUT /api/teams/:id - Update a team
router.put("/:id", (req, res) => {
  try {
    const { team_name, pokemon_data } = req.body;

    if (!team_name || !pokemon_data) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updated = PokemonTeam.update(req.params.id, {
      team_name,
      pokemon_data,
    });

    if (!updated) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({ message: "Team updated successfully" });
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ error: "Failed to update team" });
  }
});

// DELETE /api/teams/:id - Delete a team
router.delete("/:id", (req, res) => {
  try {
    const result = PokemonTeam.delete(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ error: "Failed to delete team" });
  }
});

module.exports = router;
