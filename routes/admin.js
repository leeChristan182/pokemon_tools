const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET /api/admin/database - View database statistics
router.get("/", (req, res) => {
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `).all();

    const stats = {};
    tables.forEach(table => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      stats[table.name] = count.count;
    });

    res.json({
      database: "pokemon_tools.db",
      tables: tables.map(t => t.name),
      statistics: stats
    });
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Failed to query database" });
  }
});

// GET /api/admin/tables/:tableName - View table contents
router.get("/tables/:tableName", (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    // Validate table name exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name=?
    `).get(tableName);

    if (!tableExists) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Get table data
    const data = db.prepare(`SELECT * FROM ${tableName} LIMIT ?`).all(limit);
    
    // Get table schema
    const schema = db.prepare(`PRAGMA table_info(${tableName})`).all();

    res.json({
      table: tableName,
      rowCount: data.length,
      schema: schema,
      data: data
    });
  } catch (error) {
    console.error("Error querying table:", error);
    res.status(500).json({ error: "Failed to query table" });
  }
});

// POST /api/admin/query - Execute custom SQL query (read-only)
router.post("/query", (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    // Only allow SELECT statements for safety
    if (!sql.trim().toUpperCase().startsWith("SELECT")) {
      return res.status(403).json({ 
        error: "Only SELECT queries are allowed",
        note: "Use specific API endpoints for INSERT/UPDATE/DELETE operations"
      });
    }

    const result = db.prepare(sql).all();
    res.json({
      rowCount: result.length,
      data: result
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
