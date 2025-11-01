import React, { useEffect, useState } from 'react';
import { View, ScrollView, TextInput, Image, StyleSheet, Alert } from 'react-native';
import { Provider as PaperProvider, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';

const API_CONFIG = {
  relational: 'https://hxh-crud-app.onrender.com',
  nosql: 'https://hxh-nosql.onrender.com'
};

export default function App() {
  const [activeDB, setActiveDB] = useState('relational');
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', age: '', height_cm: '', weight_kg: '', nen_type: '', origin: '', image_url: '' });

  const apiUrl = activeDB === 'relational' ? `${API_CONFIG.relational}/characters` : `${API_CONFIG.nosql}/characters`;

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl);
      setCharacters(res.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los personajes');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCharacters(); }, [activeDB]);

  const handleSave = async () => {
    if (!form.name || !form.image_url) {
      Alert.alert('Error', 'Nombre e imagen son obligatorios');
      return;
    }
    try {
      if (form.id) {
        await axios.put(`${apiUrl}/${form.id}`, form);
      } else {
        await axios.post(apiUrl, form);
      }
      setForm({ id: null, name: '', age: '', height_cm: '', weight_kg: '', nen_type: '', origin: '', image_url: '' });
      fetchCharacters();
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar el personaje');
    }
  };

  const handleEdit = (char) => setForm({
    id: char.id || char._id,
    name: char.name,
    age: char.age?.toString() || '',
    height_cm: char.height_cm?.toString() || '',
    weight_kg: char.weight_kg?.toString() || '',
    nen_type: char.nen_type || '',
    origin: char.origin || '',
    image_url: char.image_url || ''
  });

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/${id}`);
      fetchCharacters();
    } catch (err) {
      Alert.alert('Error', 'No se pudo eliminar');
    }
  };

  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Hunter × Hunter Characters</Text>

        <View style={styles.dbSwitch}>
          <Button mode={activeDB === 'relational' ? 'contained' : 'outlined'} onPress={() => setActiveDB('relational')}>Relational</Button>
          <Button mode={activeDB === 'nosql' ? 'contained' : 'outlined'} onPress={() => setActiveDB('nosql')}>NoSQL</Button>
        </View>

        <View style={styles.form}>
          {['name', 'age', 'height_cm', 'weight_kg', 'nen_type', 'origin', 'image_url'].map((field) => (
            <TextInput
              key={field}
              style={styles.input}
              placeholder={field.replace('_', ' ').toUpperCase()}
              placeholderTextColor="#9b4dca"
              value={form[field]}
              onChangeText={(val) => setForm({ ...form, [field]: val })}
            />
          ))}
          <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
            {form.id ? 'Actualizar' : 'Agregar'}
          </Button>
        </View>

        {loading ? (
          <ActivityIndicator animating={true} color="#00ff41" />
        ) : (
          characters.map((char) => (
            <Card key={char.id || char._id} style={styles.card}>
              <Card.Cover source={{ uri: char.image_url }} />
              <Card.Content>
                <Text style={styles.name}>{char.name}</Text>
                <Text style={styles.info}>{char.nen_type || 'Desconocido'} | {char.origin}</Text>
                <Text style={styles.info}>Altura: {char.height_cm} cm | Peso: {char.weight_kg} kg</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleEdit(char)}>Editar</Button>
                <Button onPress={() => handleDelete(char.id || char._id)} textColor="#9b4dca">Eliminar</Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 10
  },
  title: {
    color: '#00ff41',
    fontSize: 26,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold'
  },
  dbSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  form: {
    marginBottom: 30
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#00ff41',
    borderWidth: 1,
    borderColor: '#9b4dca',
    borderRadius: 8,
    marginVertical: 5,
    padding: 10
  },
  saveBtn: {
    backgroundColor: '#00ff41',
    marginTop: 10
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#9b4dca'
  },
  name: {
    color: '#00ff41',
    fontSize: 20,
    fontWeight: 'bold'
  },
  info: {
    color: '#ccc'
  }
});
