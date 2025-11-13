const express = require("express");
const router = express.Router();
const axios = require("axios");
const EditedItem = require("../models/EditedItem");

// Proxy endpoint to fetch Item with edited data merged
router.get("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Fetch from PokeAPI
    const apiResponse = await axios.get(`https://pokeapi.co/api/v2/item/${itemId}`);
    const itemData = apiResponse.data;
    
    // Check if there's edited data for this item
    const editedData = EditedItem.getById(itemData.id);
    
    // Build the response with merged data
    const response = {
      ...itemData,
      edited: !!editedData,
      custom_data: editedData ? {
        effect_description: editedData.effect_description,
        cost: editedData.cost,
        custom_notes: editedData.custom_notes,
        edited_at: editedData.edited_at,
        updated_at: editedData.updated_at
      } : null
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error fetching item:", error);
    if (error.response?.status === 404) {
      res.status(404).json({ error: "Item not found" });
    } else {
      res.status(500).json({ error: "Failed to fetch item data" });
    }
  }
});

// List items endpoint (optionally with edited flags)
router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit || 1000;
    const offset = req.query.offset || 0;
    
    // Fetch from PokeAPI
    const apiResponse = await axios.get(`https://pokeapi.co/api/v2/item?limit=${limit}&offset=${offset}`);
    const itemsData = apiResponse.data;
    
    // Get all edited items
    const allEditedItems = EditedItem.getAll();
    const editedMap = {};
    allEditedItems.forEach(item => {
      editedMap[item.item_id] = true;
    });
    
    // Mark which items have been edited
    const results = itemsData.results.map(item => {
      // Extract ID from URL
      const urlParts = item.url.split('/').filter(Boolean);
      const itemId = parseInt(urlParts[urlParts.length - 1]);
      
      return {
        ...item,
        edited: !!editedMap[itemId]
      };
    });
    
    res.json({
      ...itemsData,
      results
    });
  } catch (error) {
    console.error("Error fetching items list:", error);
    res.status(500).json({ error: "Failed to fetch items list" });
  }
});

module.exports = router;
