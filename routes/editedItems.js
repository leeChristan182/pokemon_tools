const express = require("express");
const router = express.Router();
const EditedItem = require("../models/EditedItem");

// Get all edited items
router.get("/", (req, res) => {
  try {
    const editedItems = EditedItem.getAll();
    res.json(editedItems);
  } catch (error) {
    console.error("Error fetching edited items:", error);
    res.status(500).json({ error: "Failed to fetch edited items" });
  }
});

// Get single edited item by ID
router.get("/:id", (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    
    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }
    
    const editedItem = EditedItem.getById(itemId);
    
    if (!editedItem) {
      return res.json({ edited: false });
    }
    
    res.json({ edited: true, data: editedItem });
  } catch (error) {
    console.error("Error fetching edited item:", error);
    res.status(500).json({ error: "Failed to fetch edited item" });
  }
});

// Create or update edited item
router.post("/", (req, res) => {
  try {
    const { item_id, item_name } = req.body;
    
    if (!item_id || !item_name) {
      return res.status(400).json({ error: "Item ID and name are required" });
    }
    
    const result = EditedItem.upsert(req.body);
    res.status(201).json({ 
      message: "Item data saved successfully", 
      item_id: req.body.item_id,
      changes: result.changes
    });
  } catch (error) {
    console.error("Error saving edited item:", error);
    res.status(500).json({ error: "Failed to save edited item" });
  }
});

// Delete edited item (revert to API data)
router.delete("/:id", (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const result = EditedItem.delete(itemId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "No edited data found for this item" });
    }
    
    res.json({ message: "Item reverted to API data successfully" });
  } catch (error) {
    console.error("Error deleting edited item:", error);
    res.status(500).json({ error: "Failed to delete edited item" });
  }
});

module.exports = router;
