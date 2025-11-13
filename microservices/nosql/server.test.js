const request = require('supertest');
const express = require('express');

// Crear app de prueba simple
const app = express();
app.use(express.json());

// Mock simple de base de datos en memoria
let mockDB = [
  { _id: '1', name: 'Hisoka', age: 28, nen_type: 'Transmuter', image_url: 'http://example.com/hisoka.jpg' },
  { _id: '2', name: 'Chrollo', age: 26, nen_type: 'Specialist', image_url: 'http://example.com/chrollo.jpg' }
];

// Rutas simuladas
app.get('/characters', (req, res) => {
  res.json(mockDB);
});

app.post('/characters', (req, res) => {
  const { name, image_url } = req.body;
  if (!name || !image_url) {
    return res.status(400).json({ error: 'Name and image_url required' });
  }
  const newChar = { _id: String(mockDB.length + 1), ...req.body };
  mockDB.push(newChar);
  res.status(201).json(newChar);
});

app.delete('/characters/:id', (req, res) => {
  const index = mockDB.findIndex(c => c._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Character not found' });
  }
  const deleted = mockDB.splice(index, 1)[0];
  res.json({ message: 'Character deleted', deleted });
});

describe('Microservicio NoSQL - MongoDB', () => {
  
  beforeEach(() => {
    // Resetear DB antes de cada test
    mockDB = [
      { _id: '1', name: 'Hisoka', age: 28, nen_type: 'Transmuter', image_url: 'http://example.com/hisoka.jpg' },
      { _id: '2', name: 'Chrollo', age: 26, nen_type: 'Specialist', image_url: 'http://example.com/chrollo.jpg' }
    ];
  });

  // Test 1: GET /characters - Obtener todos los personajes
  test('GET /characters - Debe retornar lista de personajes', async () => {
    const response = await request(app).get('/characters');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Hisoka');
    expect(response.body[1].name).toBe('Chrollo');
  });

  // Test 2: POST /characters - Crear personaje (CON MOCK de DB en memoria)
  test('POST /characters - Debe crear un nuevo personaje (usando mock)', async () => {
    const newCharacter = {
      name: 'Illumi Zoldyck',
      age: 24,
      height_cm: 185,
      weight_kg: 68,
      nen_type: 'Manipulator',
      origin: 'Zoldyck Family',
      image_url: 'http://example.com/illumi.jpg'
    };

    const response = await request(app)
      .post('/characters')
      .send(newCharacter);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('Illumi Zoldyck');
    expect(mockDB).toHaveLength(3);
  });

  // Test 3: DELETE /characters/:id - Eliminar personaje
  test('DELETE /characters/:id - Debe eliminar un personaje', async () => {
    const response = await request(app).delete('/characters/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Character deleted');
    expect(response.body.deleted.name).toBe('Hisoka');
    expect(mockDB).toHaveLength(1);
  });

  // Test 4: POST /characters - Validación de campos requeridos
  test('POST /characters - Debe fallar sin campos obligatorios', async () => {
    const invalidCharacter = {
      age: 20
    };

    const response = await request(app)
      .post('/characters')
      .send(invalidCharacter);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Name and image_url required');
  });

  // Test 5: DELETE /characters/:id - Personaje no encontrado
  test('DELETE /characters/:id - Debe retornar 404 si no existe', async () => {
    const response = await request(app).delete('/characters/999');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Character not found');
  });

});