const Database = require("better-sqlite3");
const path = require("path");

// Create database file in the project root
const dbPath = path.join(__dirname, "..", "pokemon_tools.db");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = OFF"); // Disabled since we don't use users

// Initialize database schema
const initializeDatabase = () => {
  console.log("🔧 Initializing database...");

  // Quiz Scores table (no user required)
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      quiz_type TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Berry Memory Game Scores table (no user required)
  db.exec(`
    CREATE TABLE IF NOT EXISTS berry_game_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      moves INTEGER NOT NULL,
      time_seconds INTEGER,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Pokedoku Progress table (no user required)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pokedoku_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grid_data TEXT NOT NULL,
      guesses_remaining INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Pokedoku Scores table (for leaderboard)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pokedoku_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      moves_used INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      puzzle_difficulty TEXT DEFAULT 'normal',
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Edited Pokemon data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS edited_pokemon (
      pokemon_id INTEGER PRIMARY KEY,
      pokemon_name TEXT NOT NULL,
      flavor_text TEXT,
      classification TEXT,
      abilities TEXT,
      habitat TEXT,
      egg_groups TEXT,
      growth_rate TEXT,
      custom_notes TEXT,
      edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Edited Items data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS edited_items (
      item_id INTEGER PRIMARY KEY,
      item_name TEXT NOT NULL,
      effect_description TEXT,
      cost INTEGER,
      custom_notes TEXT,
      edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Edited Move data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS edited_moves (
      move_name TEXT PRIMARY KEY,
      flavor_text TEXT,
      custom_notes TEXT,
      edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Database initialized successfully!");
};

// Initialize the database
initializeDatabase();

module.exports = db;
