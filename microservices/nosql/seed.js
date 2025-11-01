const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

async function seed() {
  try {
    await client.connect();
    const db = client.db('hxh_db');
    const collection = db.collection('characters');

    const data = [
      { name: 'Hisoka Morow', age: 28, height_cm: 187, weight_kg: 91, nen_type: 'Transmuter', origin: 'Desconocido', image_url: 'https://static.wikia.nocookie.net/hunterxhunter/images/9/9f/Hisoka_Design.png', notes: 'Mago asesino con fascinación por oponentes fuertes.' },
      { name: 'Chrollo Lucilfer', age: 26, height_cm: 177, weight_kg: 68, nen_type: 'Specialist', origin: 'Meteor City', image_url: 'https://static.wikia.nocookie.net/hunterxhunter/images/0/09/Chrollo_Design.png', notes: 'Líder de la Brigada Fantasma.' },
      { name: 'Feitan Portor', age: 28, height_cm: 160, weight_kg: 45, nen_type: 'Transmuter', origin: 'Meteor City', image_url: 'https://static.wikia.nocookie.net/hunterxhunter/images/b/bc/Feitan_Design.png', notes: 'Torturador de la Brigada Fantasma.' },
      { name: 'Phinks Magcub', age: 33, height_cm: 185, weight_kg: 91, nen_type: 'Enhancer', origin: 'Meteor City', image_url: 'https://static.wikia.nocookie.net/hunterxhunter/images/2/2b/Phinks_Design.png', notes: 'Miembro de la Brigada Fantasma.' },
      { name: 'Machi Komacine', age: 24, height_cm: 159, weight_kg: 49, nen_type: 'Transmuter', origin: 'Meteor City', image_url: 'https://static.wikia.nocookie.net/hunterxhunter/images/8/83/Machi_Design.png', notes: 'Experta en hilos de Nen.' },
      { name: 'Shalnark', age: 24, height_cm: 170, weight_kg: 60, nen_type: 'Manipulator', origin: 'Meteor City', image_url: 'https://static.wikia.nocookie.net/hunterxhunter/images/3/3a/Shalnark_Design.png', notes: 'Intelectual y estratega de la Brigada Fantasma.' }
    ];

    await collection.deleteMany({});
    await collection.insertMany(data);
    console.log('✅ MongoDB seeded with 6 Hunter x Hunter characters');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await client.close();
  }
}

seed();
