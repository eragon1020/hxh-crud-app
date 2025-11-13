const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');

// Mock de PostgreSQL
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Importar app sin iniciar servidor
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const pool = new Pool();

// Recrear rutas para testing
app.get('/characters', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM characters ORDER BY id');
    res.json(result.rows);
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

app.delete('/characters/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM characters WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Character not found' });
    res.json({ message: 'Character deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

describe('Microservicio Relational - PostgreSQL', () => {
  
  // Test 1: GET /characters - Obtener todos los personajes
  test('GET /characters - Debe retornar lista de personajes', async () => {
    const mockCharacters = [
      { id: 1, name: 'Gon Freecss', age: 12, nen_type: 'Enhancer', image_url: 'http://example.com/gon.jpg' },
      { id: 2, name: 'Killua Zoldyck', age: 12, nen_type: 'Transmuter', image_url: 'http://example.com/killua.jpg' }
    ];

    pool.query.mockResolvedValue({ rows: mockCharacters });

    const response = await request(app).get('/characters');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCharacters);
    expect(response.body).toHaveLength(2);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM characters ORDER BY id');
  });

  // Test 2: POST /characters - Crear personaje (CON MOCK)
  test('POST /characters - Debe crear un nuevo personaje (usando mock)', async () => {
    const newCharacter = {
      name: 'Kurapika',
      age: 17,
      height_cm: 171,
      weight_kg: 59,
      nen_type: 'Conjurer',
      origin: 'Kurta Clan',
      image_url: 'http://example.com/kurapika.jpg',
      notes: 'Chain user'
    };

    const mockResult = {
      rows: [{ id: 3, ...newCharacter }]
    };

    pool.query.mockResolvedValue(mockResult);

    const response = await request(app)
      .post('/characters')
      .send(newCharacter);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Kurapika');
    expect(pool.query).toHaveBeenCalled();
  });

  // Test 3: DELETE /characters/:id - Eliminar personaje
  test('DELETE /characters/:id - Debe eliminar un personaje', async () => {
    const mockDeleted = {
      rows: [{ id: 1, name: 'Gon Freecss', age: 12 }]
    };

    pool.query.mockResolvedValue(mockDeleted);

    const response = await request(app).delete('/characters/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Character deleted');
    expect(response.body.deleted.name).toBe('Gon Freecss');
  });

  // Test 4: POST /characters - Validación de campos requeridos
  test('POST /characters - Debe fallar sin campos obligatorios', async () => {
    const invalidCharacter = {
      age: 15
      // Falta name e image_url
    };

    const response = await request(app)
      .post('/characters')
      .send(invalidCharacter);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Name and image_url required');
  });

});