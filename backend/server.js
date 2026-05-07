const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "postgres",
  database: "crud_db",
  password: "postgres",
  port: 5432,
});

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(200)
  )
`);

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// CREATE
app.post("/items", async (req, res) => {
  const { name, description } = req.body;

  await pool.query(
    "INSERT INTO items(name, description) VALUES($1, $2)",
    [name, description]
  );

  res.status(201).json({
    message: "Item created"
  });
});

// READ
app.get("/items", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM items ORDER BY id ASC"
  );

  res.status(200).json(result.rows);
});

// UPDATE
app.put("/items/:id", async (req, res) => {
  const { name, description } = req.body;

  await pool.query(
    "UPDATE items SET name=$1, description=$2 WHERE id=$3",
    [name, description, req.params.id]
  );

  res.status(200).json({
    message: "Updated"
  });
});

// DELETE
app.delete("/items/:id", async (req, res) => {
  await pool.query(
    "DELETE FROM items WHERE id=$1",
    [req.params.id]
  );

  res.status(200).json({
    message: "Deleted"
  });
});

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});