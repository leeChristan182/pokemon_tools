const db = require("../config/database");

class BerryGameScore {
  // Create a new berry game score
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO berry_game_scores (player_name, score, moves, time_seconds)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.player_name,
      data.score,
      data.moves,
      data.time_seconds || null
    );
    return { id: result.lastInsertRowid, ...data };
  }

  // Get all berry game scores
  static getAll(limit = 10) {
    const stmt = db.prepare(`
      SELECT * FROM berry_game_scores
      ORDER BY score DESC, moves ASC, time_seconds ASC, completed_at DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  // Get leaderboard
  static getLeaderboard(limit = 10) {
    const stmt = db.prepare(`
      SELECT 
        player_name,
        MIN(moves) as best_moves,
        MIN(time_seconds) as best_time,
        COUNT(*) as games_played
      FROM berry_game_scores
      GROUP BY player_name
      ORDER BY best_moves ASC, best_time ASC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  // Get scores by player name
  static getByPlayer(playerName) {
    const stmt = db.prepare(`
      SELECT * FROM berry_game_scores
      WHERE player_name = ?
      ORDER BY completed_at DESC
    `);
    return stmt.all(playerName);
  }

  // Delete a score
  static delete(id) {
    const stmt = db.prepare("DELETE FROM berry_game_scores WHERE id = ?");
    return stmt.run(id);
  }
}

module.exports = BerryGameScore;
