const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
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
        url: 'https://hxh-crud-app.onrender.com',
        description: 'Production Server'
      },
      {
        url: `http://localhost:${PORT}`,
        description: 'Development Server'
      }
    ],
    components: {
      schemas: {
        Character: {
          type: 'object',
          required: ['name', 'image_url'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID autogenerado',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Nombre del personaje',
              example: 'Gon Freecss'
            },
            age: {
              type: 'integer',
              description: 'Edad del personaje',
              example: 12
            },
            height_cm: {
              type: 'integer',
              description: 'Altura en centímetros',
              example: 154
            },
            weight_kg: {
              type: 'integer',
              description: 'Peso en kilogramos',
              example: 49
            },
            nen_type: {
              type: 'string',
              description: 'Tipo de Nen',
              example: 'Enhancer'
            },
            origin: {
              type: 'string',
              description: 'Origen del personaje',
              example: 'Whale Island'
            },
            image_url: {
              type: 'string',
              description: 'URL de la imagen',
              example: 'https://example.com/gon.jpg'
            },
            notes: {
              type: 'string',
              description: 'Notas adicionales',
              example: 'Protagonista de la serie'
            }
          }
        },
        CharacterInput: {
          type: 'object',
          required: ['name', 'image_url'],
          properties: {
            name: {
              type: 'string',
              example: 'Killua Zoldyck'
            },
            age: {
              type: 'integer',
              example: 12
            },
            height_cm: {
              type: 'integer',
              example: 158
            },
            weight_kg: {
              type: 'integer',
              example: 45
            },
            nen_type: {
              type: 'string',
              example: 'Transmuter'
            },
            origin: {
              type: 'string',
              example: 'Kukuroo Mountain'
            },
            image_url: {
              type: 'string',
              example: 'https://example.com/killua.jpg'
            },
            notes: {
              type: 'string',
              example: 'Mejor amigo de Gon'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, 'server.js')]
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
 * /:
 *   get:
 *     summary: Información de la API
 *     description: Retorna información básica de la API
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Información básica de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 docs:
 *                   type: string
 */
app.get('/', (req, res) => {
  res.json({ message: 'Hunter x Hunter Relational API', docs: '/api-docs' });
});

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Obtener todos los personajes
 *     description: Retorna una lista de todos los personajes de Hunter x Hunter
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: Lista de personajes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Character'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/characters', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM characters ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     summary: Obtener un personaje por ID
 *     description: Retorna un personaje específico según su ID
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del personaje
 *         example: 1
 *     responses:
 *       200:
 *         description: Personaje encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       404:
 *         description: Personaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/characters/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM characters WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Character not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /characters:
 *   post:
 *     summary: Crear un nuevo personaje
 *     description: Crea un nuevo personaje en la base de datos
 *     tags: [Characters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CharacterInput'
 *     responses:
 *       201:
 *         description: Personaje creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /characters/{id}:
 *   put:
 *     summary: Actualizar un personaje
 *     description: Actualiza todos los campos de un personaje existente
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del personaje
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CharacterInput'
 *     responses:
 *       200:
 *         description: Personaje actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Personaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /characters/{id}:
 *   delete:
 *     summary: Eliminar un personaje
 *     description: Elimina un personaje de la base de datos
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del personaje
 *         example: 1
 *     responses:
 *       200:
 *         description: Personaje eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Character deleted'
 *                 deleted:
 *                   $ref: '#/components/schemas/Character'
 *       404:
 *         description: Personaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/characters/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM characters WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Character not found' });
    res.json({ message: 'Character deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Relational service running on port ${PORT}`);
});
