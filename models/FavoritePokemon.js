const db = require("../config/database");

class FavoritePokemon {
  // Add a favorite Pokemon
  static add(userId, pokemonId, pokemonName) {
    try {
      const stmt = db.prepare(`
        INSERT INTO favorite_pokemon (user_id, pokemon_id, pokemon_name)
        VALUES (?, ?, ?)
      `);
      const result = stmt.run(userId, pokemonId, pokemonName);
      return { id: result.lastInsertRowid, userId, pokemonId, pokemonName };
    } catch (error) {
      // Handle duplicate entry
      if (error.message.includes("UNIQUE constraint failed")) {
        return null;
      }
      throw error;
    }
  }

  // Get all favorites for a user
  static getByUser(userId) {
    const stmt = db.prepare(`
      SELECT * FROM favorite_pokemon
      WHERE user_id = ?
      ORDER BY added_at DESC
    `);
    return stmt.all(userId);
  }

  // Check if a Pokemon is favorited by a user
  static isFavorite(userId, pokemonId) {
    const stmt = db.prepare(`
      SELECT id FROM favorite_pokemon
      WHERE user_id = ? AND pokemon_id = ?
    `);
    return stmt.get(userId, pokemonId) !== undefined;
  }

  // Remove a favorite
  static remove(userId, pokemonId) {
    const stmt = db.prepare(`
      DELETE FROM favorite_pokemon
      WHERE user_id = ? AND pokemon_id = ?
    `);
    return stmt.run(userId, pokemonId);
  }

  // Get favorite count for a user
  static getCount(userId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM favorite_pokemon
      WHERE user_id = ?
    `);
    return stmt.get(userId).count;
  }
}

module.exports = FavoritePokemon;
