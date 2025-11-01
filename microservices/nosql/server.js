const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB setup
const client = new MongoClient(process.env.MONGODB_URI);
let collection;

async function initDB() {
  try {
    await client.connect();
    const db = client.db('hxh_db');
    collection = db.collection('characters');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}
initDB();

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hunter x Hunter API - NoSQL (MongoDB)',
      version: '1.0.0',
      description: 'API CRUD para personajes de Hunter x Hunter (Base de datos NoSQL)'
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
 *         _id:
 *           type: string
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

// CRUD endpoints
app.get('/characters', async (req, res) => {
  try {
    const chars = await collection.find().toArray();
    res.json(chars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/characters/:id', async (req, res) => {
  try {
    const char = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!char) return res.status(404).json({ error: 'Character not found' });
    res.json(char);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/characters', async (req, res) => {
  try {
    const { name, age, height_cm, weight_kg, nen_type, origin, image_url, notes } = req.body;
    if (!name || !image_url) return res.status(400).json({ error: 'Name and image_url required' });
    const result = await collection.insertOne({ name, age, height_cm, weight_kg, nen_type, origin, image_url, notes });
    res.status(201).json(result.ops ? result.ops[0] : result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/characters/:id', async (req, res) => {
  try {
    const { name, age, height_cm, weight_kg, nen_type, origin, image_url, notes } = req.body;
    if (!name || !image_url) return res.status(400).json({ error: 'Name and image_url required' });
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, age, height_cm, weight_kg, nen_type, origin, image_url, notes } },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: 'Character not found' });
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/characters/:id', async (req, res) => {
  try {
    const result = await collection.findOneAndDelete({ _id: new ObjectId(req.params.id) });
    if (!result.value) return res.status(404).json({ error: 'Character not found' });
    res.json({ message: 'Character deleted', deleted: result.value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Hunter x Hunter NoSQL API', docs: '/api-docs' });
});

app.listen(PORT, () => console.log(`🚀 NoSQL service running on port ${PORT}`));
