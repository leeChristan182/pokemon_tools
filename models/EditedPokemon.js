const db = require("../config/database");

class EditedPokemon {
  // Get edited pokemon by ID
  static getById(pokemonId) {
    const stmt = db.prepare("SELECT * FROM edited_pokemon WHERE pokemon_id = ?");
    return stmt.get(pokemonId);
  }

  // Get all edited pokemon
  static getAll() {
    const stmt = db.prepare("SELECT * FROM edited_pokemon ORDER BY updated_at DESC");
    return stmt.all();
  }

  // Create or update edited pokemon
  static upsert(pokemonData) {
    const stmt = db.prepare(`
      INSERT INTO edited_pokemon 
        (pokemon_id, pokemon_name, flavor_text, classification, abilities, 
         habitat, egg_groups, growth_rate, custom_notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(pokemon_id) DO UPDATE SET
        pokemon_name = excluded.pokemon_name,
        flavor_text = excluded.flavor_text,
        classification = excluded.classification,
        abilities = excluded.abilities,
        habitat = excluded.habitat,
        egg_groups = excluded.egg_groups,
        growth_rate = excluded.growth_rate,
        custom_notes = excluded.custom_notes,
        updated_at = CURRENT_TIMESTAMP
    `);

    return stmt.run(
      pokemonData.pokemon_id,
      pokemonData.pokemon_name,
      pokemonData.flavor_text || null,
      pokemonData.classification || null,
      pokemonData.abilities || null,
      pokemonData.habitat || null,
      pokemonData.egg_groups || null,
      pokemonData.growth_rate || null,
      pokemonData.custom_notes || null
    );
  }

  // Delete edited pokemon (revert to API data)
  static delete(pokemonId) {
    const stmt = db.prepare("DELETE FROM edited_pokemon WHERE pokemon_id = ?");
    return stmt.run(pokemonId);
  }
}

module.exports = EditedPokemon;
