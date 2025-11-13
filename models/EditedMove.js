const db = require("../config/database");

class EditedMove {
  // Get edited move by name
  static getByName(moveName) {
    const stmt = db.prepare("SELECT * FROM edited_moves WHERE move_name = ?");
    return stmt.get(moveName);
  }

  // Get all edited moves
  static getAll() {
    const stmt = db.prepare("SELECT * FROM edited_moves ORDER BY updated_at DESC");
    return stmt.all();
  }

  // Create or update edited move
  static upsert(moveData) {
    const stmt = db.prepare(`
      INSERT INTO edited_moves 
        (move_name, flavor_text, custom_notes, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(move_name) DO UPDATE SET
        flavor_text = excluded.flavor_text,
        custom_notes = excluded.custom_notes,
        updated_at = CURRENT_TIMESTAMP
    `);

    return stmt.run(
      moveData.move_name,
      moveData.flavor_text || null,
      moveData.custom_notes || null
    );
  }

  // Delete edited move (revert to API data)
  static delete(moveName) {
    const stmt = db.prepare("DELETE FROM edited_moves WHERE move_name = ?");
    return stmt.run(moveName);
  }
}

module.exports = EditedMove;
