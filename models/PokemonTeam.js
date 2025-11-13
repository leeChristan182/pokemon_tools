const db = require("../config/database");

class PokemonTeam {
  // Create a new team
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO pokemon_teams (team_name, pokemon_data)
      VALUES (?, ?)
    `);
    const result = stmt.run(
      data.team_name,
      JSON.stringify(data.pokemon_data)
    );
    return { id: result.lastInsertRowid, ...data };
  }

  // Get all teams
  static getAll() {
    const stmt = db.prepare("SELECT * FROM pokemon_teams ORDER BY updated_at DESC");
    const teams = stmt.all();
    
    // Parse JSON pokemon_data
    return teams.map(team => ({
      ...team,
      pokemon_data: JSON.parse(team.pokemon_data)
    }));
  }

  // Get team by ID
  static getById(id) {
    const stmt = db.prepare("SELECT * FROM pokemon_teams WHERE id = ?");
    const team = stmt.get(id);
    if (team) {
      team.pokemon_data = JSON.parse(team.pokemon_data);
    }
    return team;
  }

  // Update a team
  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE pokemon_teams 
      SET team_name = ?, pokemon_data = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(
      data.team_name,
      JSON.stringify(data.pokemon_data),
      id
    );
    return result.changes > 0;
  }

  // Delete a team
  static delete(id) {
    const stmt = db.prepare("DELETE FROM pokemon_teams WHERE id = ?");
    return stmt.run(id);
  }
}

module.exports = PokemonTeam;
