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
 *           description: ID único del personaje (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Nombre del personaje
 *           example: "Gon Freecss"
 *         age:
 *           type: integer
 *           description: Edad del personaje
 *           example: 12
 *         height_cm:
 *           type: integer
 *           description: Altura en centímetros
 *           example: 154
 *         weight_kg:
 *           type: integer
 *           description: Peso en kilogramos
 *           example: 49
 *         nen_type:
 *           type: string
 *           description: Tipo de Nen
 *           example: "Enhancer"
 *         origin:
 *           type: string
 *           description: Lugar de origen
 *           example: "Whale Island"
 *         image_url:
 *           type: string
 *           description: URL de la imagen del personaje
 *           example: "https://example.com/gon.jpg"
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *           example: "Protagonista de la serie"
 *     CharacterInput:
 *       type: object
 *       required:
 *         - name
 *         - image_url
 *       properties:
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
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Error message"
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Ruta raíz de la API
 *     description: Retorna información básica de la API
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Información de la API
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
  res.json({ message: 'Hunter x Hunter NoSQL API', docs: '/api-docs' });
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
    const chars = await collection.find().toArray();
    res.json(chars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     summary: Obtener un personaje por ID
 *     description: Retorna un personaje específico según su ID de MongoDB
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del personaje (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
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
    const char = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!char) return res.status(404).json({ error: 'Character not found' });
    res.json(char);
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
 *           example:
 *             name: "Killua Zoldyck"
 *             age: 12
 *             height_cm: 158
 *             weight_kg: 45
 *             nen_type: "Transmuter"
 *             origin: "Kukuroo Mountain"
 *             image_url: "https://example.com/killua.jpg"
 *             notes: "Mejor amigo de Gon"
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
    const result = await collection.insertOne({ name, age, height_cm, weight_kg, nen_type, origin, image_url, notes });
    res.status(201).json(result.ops ? result.ops[0] : result);
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
 *           type: string
 *         description: ID del personaje (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CharacterInput'
 *           example:
 *             name: "Killua Zoldyck"
 *             age: 13
 *             height_cm: 160
 *             weight_kg: 47
 *             nen_type: "Transmuter"
 *             origin: "Kukuroo Mountain"
 *             image_url: "https://example.com/killua.jpg"
 *             notes: "Actualizado"
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
 *           type: string
 *         description: ID del personaje (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
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
 *                   example: "Character deleted"
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
    const result = await collection.findOneAndDelete({ _id: new ObjectId(req.params.id) });
    if (!result.value) return res.status(404).json({ error: 'Character not found' });
    res.json({ message: 'Character deleted', deleted: result.value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 NoSQL service running on port ${PORT}`));