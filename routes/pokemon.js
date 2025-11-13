const express = require("express");
const router = express.Router();
const axios = require("axios");
const EditedPokemon = require("../models/EditedPokemon");

// Proxy endpoint to fetch Pokemon with edited data merged
router.get("/:id", async (req, res) => {
  try {
    const pokemonId = req.params.id;
    
    // Fetch from PokeAPI
    const apiResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const pokemonData = apiResponse.data;
    
    // Fetch species data for additional info
    const speciesResponse = await axios.get(pokemonData.species.url);
    const speciesData = speciesResponse.data;
    
    // Check if there's edited data for this Pokemon
    const editedData = EditedPokemon.getById(pokemonData.id);
    
    // Build the response with merged data
    const response = {
      ...pokemonData,
      species_data: speciesData,
      edited: !!editedData,
      custom_data: editedData ? {
        flavor_text: editedData.flavor_text,
        classification: editedData.classification,
        abilities: editedData.abilities,
        habitat: editedData.habitat,
        egg_groups: editedData.egg_groups,
        growth_rate: editedData.growth_rate,
        custom_notes: editedData.custom_notes,
        edited_at: editedData.edited_at,
        updated_at: editedData.updated_at
      } : null
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    if (error.response?.status === 404) {
      res.status(404).json({ error: "Pokemon not found" });
    } else {
      res.status(500).json({ error: "Failed to fetch Pokemon data" });
    }
  }
});

// Proxy endpoint for species data with edited info
router.get("/species/:id", async (req, res) => {
  try {
    const speciesId = req.params.id;
    
    // Fetch from PokeAPI
    const apiResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`);
    const speciesData = apiResponse.data;
    
    // Get the Pokemon ID from species to check edited data
    // Species ID matches Pokemon ID for most Pokemon
    const editedData = EditedPokemon.getById(parseInt(speciesId));
    
    const response = {
      ...speciesData,
      edited: !!editedData,
      custom_data: editedData ? {
        flavor_text: editedData.flavor_text,
        classification: editedData.classification,
        habitat: editedData.habitat,
        egg_groups: editedData.egg_groups,
        growth_rate: editedData.growth_rate,
        custom_notes: editedData.custom_notes
      } : null
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error fetching species:", error);
    if (error.response?.status === 404) {
      res.status(404).json({ error: "Species not found" });
    } else {
      res.status(500).json({ error: "Failed to fetch species data" });
    }
  }
});

module.exports = router;
