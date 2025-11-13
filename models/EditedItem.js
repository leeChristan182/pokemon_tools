const db = require("../config/database");

class EditedItem {
  // Get edited item by ID
  static getById(itemId) {
    const stmt = db.prepare("SELECT * FROM edited_items WHERE item_id = ?");
    return stmt.get(itemId);
  }

  // Get all edited items
  static getAll() {
    const stmt = db.prepare("SELECT * FROM edited_items ORDER BY updated_at DESC");
    return stmt.all();
  }

  // Create or update edited item
  static upsert(itemData) {
    const stmt = db.prepare(`
      INSERT INTO edited_items 
        (item_id, item_name, effect_description, cost, custom_notes, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(item_id) DO UPDATE SET
        item_name = excluded.item_name,
        effect_description = excluded.effect_description,
        cost = excluded.cost,
        custom_notes = excluded.custom_notes,
        updated_at = CURRENT_TIMESTAMP
    `);

    return stmt.run(
      itemData.item_id,
      itemData.item_name,
      itemData.effect_description || null,
      itemData.cost || null,
      itemData.custom_notes || null
    );
  }

  // Delete edited item (revert to API data)
  static delete(itemId) {
    const stmt = db.prepare("DELETE FROM edited_items WHERE item_id = ?");
    return stmt.run(itemId);
  }
}

module.exports = EditedItem;
