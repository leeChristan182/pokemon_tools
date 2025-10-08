const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Serve the built Vue frontend ---
const __dirnamePath = path.resolve();

// Serve static files from frontend/dist
app.use(express.static(path.join(__dirnamePath, "frontend/dist")));

// Example API route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from Express backend API!" });
});

// Handle all other routes (for Vue Router SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirnamePath, "frontend/dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
