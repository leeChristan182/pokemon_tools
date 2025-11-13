const db = require("../config/database");

class QuizScore {
  // Create a new quiz score
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO quiz_scores (player_name, score, total_questions, quiz_type)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.player_name,
      data.score,
      data.total_questions,
      data.quiz_type || null
    );
    return { id: result.lastInsertRowid, ...data };
  }

  // Get all quiz scores with optional filtering
  static getAll(limit = 10, quizType = null) {
    let query = `
      SELECT * FROM quiz_scores
      ${quizType ? "WHERE quiz_type = ?" : ""}
      ORDER BY score DESC, completed_at DESC
      LIMIT ?
    `;
    const stmt = db.prepare(query);
    return quizType ? stmt.all(quizType, limit) : stmt.all(limit);
  }

  // Get leaderboard
  static getLeaderboard(limit = 10) {
    const stmt = db.prepare(`
      SELECT 
        player_name,
        MAX(score) as best_score,
        COUNT(*) as games_played,
        AVG(score) as avg_score
      FROM quiz_scores
      GROUP BY player_name
      ORDER BY best_score DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  // Get scores by player name
  static getByPlayer(playerName) {
    const stmt = db.prepare(`
      SELECT * FROM quiz_scores
      WHERE player_name = ?
      ORDER BY completed_at DESC
    `);
    return stmt.all(playerName);
  }

  // Delete a score
  static delete(id) {
    const stmt = db.prepare("DELETE FROM quiz_scores WHERE id = ?");
    return stmt.run(id);
  }
}

module.exports = QuizScore;
