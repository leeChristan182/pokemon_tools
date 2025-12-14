const db = require("../config/database");

class PokedokuScore {
  // Create a new pokedoku score
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO pokedoku_scores (player_name, moves_used, correct_answers, puzzle_difficulty)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.player_name,
      data.moves_used,
      data.correct_answers,
      data.puzzle_difficulty || 'normal'
    );
    return { id: result.lastInsertRowid, ...data };
  }

  // Get all pokedoku scores with optional filtering
  static getAll(limit = 10) {
    const query = `
      SELECT * FROM pokedoku_scores
      ORDER BY correct_answers DESC, moves_used ASC, completed_at DESC
      LIMIT ?
    `;
    const stmt = db.prepare(query);
    return stmt.all(limit);
  }

  // Get leaderboard (best scores - most correct with fewest moves)
  static getLeaderboard(limit = 10) {
    const stmt = db.prepare(`
      SELECT 
        player_name,
        moves_used,
        correct_answers,
        puzzle_difficulty,
        completed_at
      FROM pokedoku_scores
      WHERE correct_answers = 9
      ORDER BY moves_used ASC, completed_at ASC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  // Get scores by player name
  static getByPlayer(playerName) {
    const stmt = db.prepare(`
      SELECT * FROM pokedoku_scores
      WHERE player_name = ?
      ORDER BY completed_at DESC
    `);
    return stmt.all(playerName);
  }

  // Delete a score by ID
  static delete(id) {
    const stmt = db.prepare(`DELETE FROM pokedoku_scores WHERE id = ?`);
    return stmt.run(id);
  }
}

module.exports = PokedokuScore;
