const db = require("../config/database");

class FavoritePokemon {
  // Add a favorite Pokemon
  static add(pokemonId, pokemonName) {
    try {
      const stmt = db.prepare(`
        INSERT INTO favorite_pokemon (pokemon_id, pokemon_name)
        VALUES (?, ?)
      `);
      const result = stmt.run(pokemonId, pokemonName);
      return { id: result.lastInsertRowid, pokemonId, pokemonName };
    } catch (error) {
      // Handle duplicate entry
      if (error.message.includes("UNIQUE constraint failed")) {
        return null;
      }
      throw error;
    }
  }

  // Get all favorites
  static getAll() {
    const stmt = db.prepare(`
      SELECT * FROM favorite_pokemon
      ORDER BY added_at DESC
    `);
    return stmt.all();
  }

  // Check if a Pokemon is favorited
  static isFavorite(pokemonId) {
    const stmt = db.prepare(`
      SELECT id FROM favorite_pokemon
      WHERE pokemon_id = ?
    `);
    return stmt.get(pokemonId) !== undefined;
  }

  // Remove a favorite
  static remove(pokemonId) {
    const stmt = db.prepare(`
      DELETE FROM favorite_pokemon
      WHERE pokemon_id = ?
    `);
    return stmt.run(pokemonId);
  }

  // Get favorite count
  static getCount() {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM favorite_pokemon
    `);
    return stmt.get().count;
  }
}

module.exports = FavoritePokemon;
