const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hunter x Hunter API - Relational (PostgreSQL)',
      version: '1.0.0',
      description: 'API CRUD para personajes de Hunter x Hunter (Base de datos relacional)'
    },
    servers: [
      {
        url: process.env.API_URL || `http://localhost:${PORT}`,
        description: 'API Server'
      }
    ]
  },
  apis: ['./server.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Initialize DB
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS characters (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      age INTEGER,
      height_cm INTEGER,
      weight_kg INTEGER,
      nen_type VARCHAR(100),
      origin VARCHAR(255),
      image_url TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ PostgreSQL table initialized');
}
initDB();

/**
 * @swagger
 * components:
 *   schemas:
 *     Character:
 *       type: object
 *       required:
 *         - name
 *         - image_url
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         age:
 *           type: integer
 *         height_cm:
 *           type: integer
 *         weight_kg:
 *           type: integer
 *         nen_type:
 *           type: string
 *         origin:
 *           type: string
 *         image_url:
 *           type: string
 *         notes:
 *           type: string
 */

// CRUD routes
app.get('/characters', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM characters ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/characters/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM characters WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Character not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/characters', async (req, res) => {
  try {
    const { name, age, height_cm, weight_kg, nen_type, origin, image_url, notes } = req.body;
    if (!name || !image_url) return res.status(400).json({ error: 'Name and image_url required' });
    const result = await pool.query(
      `INSERT INTO characters (name, age, height_cm, weight_kg, nen_type, origin, image_url, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, age, height_cm, weight_kg, nen_type, origin, image_url, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/characters/:id', async (req, res) => {
  try {
    const { name, age, height_cm, weight_kg, nen_type, origin, image_url, notes } = req.body;
    if (!name || !image_url) return res.status(400).json({ error: 'Name and image_url required' });
    const result = await pool.query(
      `UPDATE characters SET name=$1, age=$2, height_cm=$3, weight_kg=$4, nen_type=$5,
       origin=$6, image_url=$7, notes=$8 WHERE id=$9 RETURNING *`,
      [name, age, height_cm, weight_kg, nen_type, origin, image_url, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Character not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/characters/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM characters WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Character not found' });
    res.json({ message: 'Character deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Hunter x Hunter Relational API', docs: '/api-docs' });
});

app.listen(PORT, () => {
  console.log(`🚀 Relational service running on port ${PORT}`);
});
