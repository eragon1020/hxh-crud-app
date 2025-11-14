import React, { useState } from 'react';
import { View, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import { Provider as PaperProvider, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';

const API_CONFIG = {
  relational: 'https://hxh-crud-app.onrender.com',
  nosql: 'https://hxh-nosql.onrender.com'
};

export default function App() {
  const [activeDB, setActiveDB] = useState('relational');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    id: null, 
    name: '', 
    age: '', 
    height_cm: '', 
    weight_kg: '', 
    nen_type: '', 
    origin: '', 
    image_url: '' 
  });

  const apiUrl = activeDB === 'relational' 
    ? `${API_CONFIG.relational}/characters` 
    : `${API_CONFIG.nosql}/characters`;

  // Buscar personaje por nombre
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para buscar');
      return;
    }

    setLoading(true);
    setShowForm(false);
    try {
      const res = await axios.get(apiUrl);
      const found = res.data.find(char => 
        char.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (found) {
        setSearchResult(found);
      } else {
        setSearchResult(null);
        Alert.alert('No encontrado', `No se encontró ningún personaje con el nombre "${searchQuery}"`);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
    }
    setLoading(false);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setShowForm(false);
    setForm({ 
      id: null, 
      name: '', 
      age: '', 
      height_cm: '', 
      weight_kg: '', 
      nen_type: '', 
      origin: '', 
      image_url: '' 
    });
  };

  // Guardar o actualizar personaje
  const handleSave = async () => {
    if (!form.name || !form.image_url) {
      Alert.alert('Error', 'Nombre e imagen son obligatorios');
      return;
    }

    setLoading(true);
    try {
      if (form.id) {
        await axios.put(`${apiUrl}/${form.id}`, form);
        Alert.alert('Éxito', `El personaje "${form.name}" ha sido actualizado correctamente`);
      } else {
        await axios.post(apiUrl, form);
        Alert.alert('Éxito', `El personaje "${form.name}" ha sido creado correctamente`);
      }
      
      // Limpiar todo
      setForm({ 
        id: null, 
        name: '', 
        age: '', 
        height_cm: '', 
        weight_kg: '', 
        nen_type: '', 
        origin: '', 
        image_url: '' 
      });
      setShowForm(false);
      setSearchResult(null);
      setSearchQuery('');
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar el personaje');
    }
    setLoading(false);
  };

  // Editar personaje
  const handleEdit = (char) => {
    setForm({
      id: char.id || char._id,
      name: char.name,
      age: char.age?.toString() || '',
      height_cm: char.height_cm?.toString() || '',
      weight_kg: char.weight_kg?.toString() || '',
      nen_type: char.nen_type || '',
      origin: char.origin || '',
      image_url: char.image_url || ''
    });
    setShowForm(true);
  };

  // Eliminar personaje con confirmación
  const handleDelete = async (char) => {
    const id = char.id || char._id;
    const name = char.name;

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar a "${name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await axios.delete(`${apiUrl}/${id}`);
              Alert.alert('Éxito', `El personaje "${name}" ha sido eliminado correctamente`);
              setSearchResult(null);
              setSearchQuery('');
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el personaje');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Cambiar de base de datos
  const handleDBSwitch = (db) => {
    setActiveDB(db);
    setSearchResult(null);
    setSearchQuery('');
    setShowForm(false);
    setForm({ 
      id: null, 
      name: '', 
      age: '', 
      height_cm: '', 
      weight_kg: '', 
      nen_type: '', 
      origin: '', 
      image_url: '' 
    });
  };

  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Hunter × Hunter Characters</Text>

        {/* Selector de base de datos */}
        <View style={styles.dbSwitch}>
          <Button 
            mode={activeDB === 'relational' ? 'contained' : 'outlined'} 
            onPress={() => handleDBSwitch('relational')}
            style={styles.dbButton}
          >
            Relational
          </Button>
          <Button 
            mode={activeDB === 'nosql' ? 'contained' : 'outlined'} 
            onPress={() => handleDBSwitch('nosql')}
            style={styles.dbButton}
          >
            NoSQL
          </Button>
        </View>

        {/* Buscador - SIEMPRE VISIBLE */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>🔍 Buscar Personaje</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Ingresa el nombre del personaje"
            placeholderTextColor="#9b4dca"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.searchButtons}>
            <Button 
              mode="contained" 
              onPress={handleSearch} 
              style={styles.searchBtn}
              disabled={loading}
            >
              🔍 Buscar
            </Button>
            {(searchResult || searchQuery) && (
              <Button 
                mode="outlined" 
                onPress={handleClearSearch} 
                style={styles.clearBtn}
                textColor="#ff4444"
              >
                ✖ Limpiar
              </Button>
            )}
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <ActivityIndicator animating={true} color="#00ff41" size="large" style={styles.loader} />
        )}

        {/* Resultado de búsqueda CON BOTONES */}
        {!loading && searchResult && (
          <View>
            <Card style={styles.card}>
              <Card.Cover source={{ uri: searchResult.image_url }} />
              <Card.Content>
                <Text style={styles.name}>{searchResult.name}</Text>
                <Text style={styles.info}>
                  {searchResult.nen_type || 'Desconocido'} | {searchResult.origin || 'Desconocido'}
                </Text>
                <Text style={styles.info}>
                  Edad: {searchResult.age || 'N/A'} años
                </Text>
                <Text style={styles.info}>
                  Altura: {searchResult.height_cm || 'N/A'} cm | Peso: {searchResult.weight_kg || 'N/A'} kg
                </Text>
              </Card.Content>
            </Card>

            {/* BOTONES DEBAJO DEL PERSONAJE */}
            <View style={styles.actionButtons}>
              <Button 
                mode="contained" 
                onPress={() => handleEdit(searchResult)}
                style={styles.editBtn}
                icon="pencil"
              >
                Editar
              </Button>
              <Button 
                mode="contained" 
                onPress={() => handleDelete(searchResult)}
                style={styles.deleteBtn}
                icon="delete"
              >
                Eliminar
              </Button>
            </View>
          </View>
        )}

        {/* Formulario - SOLO CUANDO SE NECESITA */}
        {showForm && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>
              ✏️ Editar Personaje
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="NOMBRE *"
              placeholderTextColor="#9b4dca"
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="EDAD"
              placeholderTextColor="#9b4dca"
              value={form.age}
              keyboardType="numeric"
              onChangeText={(val) => setForm({ ...form, age: val })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ALTURA (CM)"
              placeholderTextColor="#9b4dca"
              value={form.height_cm}
              keyboardType="numeric"
              onChangeText={(val) => setForm({ ...form, height_cm: val })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="PESO (KG)"
              placeholderTextColor="#9b4dca"
              value={form.weight_kg}
              keyboardType="numeric"
              onChangeText={(val) => setForm({ ...form, weight_kg: val })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="TIPO DE NEN"
              placeholderTextColor="#9b4dca"
              value={form.nen_type}
              onChangeText={(val) => setForm({ ...form, nen_type: val })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ORIGEN"
              placeholderTextColor="#9b4dca"
              value={form.origin}
              onChangeText={(val) => setForm({ ...form, origin: val })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="URL DE LA IMAGEN *"
              placeholderTextColor="#9b4dca"
              value={form.image_url}
              onChangeText={(val) => setForm({ ...form, image_url: val })}
            />
            
            <Button 
              mode="contained" 
              onPress={handleSave} 
              style={styles.saveBtn}
              disabled={loading}
              icon="content-save"
            >
              💾 Guardar Cambios
            </Button>

            <Button 
              mode="outlined" 
              onPress={() => {
                setShowForm(false);
                setForm({ 
                  id: null, 
                  name: '', 
                  age: '', 
                  height_cm: '', 
                  weight_kg: '', 
                  nen_type: '', 
                  origin: '', 
                  image_url: '' 
                });
              }}
              style={styles.cancelBtn}
              textColor="#ff4444"
              icon="close"
            >
              Cancelar
            </Button>
          </View>
        )}

        {/* Espacio al final */}
        <View style={{ height: 50 }} />
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
    fontSize: 28,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },
  dbSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    gap: 10
  },
  dbButton: {
    flex: 1
  },
  searchSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9b4dca'
  },
  sectionTitle: {
    color: '#00ff41',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  searchInput: {
    backgroundColor: '#0a0a0a',
    color: '#00ff41',
    borderWidth: 1,
    borderColor: '#9b4dca',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10
  },
  searchButtons: {
    flexDirection: 'row',
    gap: 10
  },
  searchBtn: {
    flex: 1,
    backgroundColor: '#9b4dca'
  },
  clearBtn: {
    flex: 1,
    borderColor: '#ff4444'
  },
  loader: {
    marginVertical: 30
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#9b4dca',
    borderRadius: 12,
    overflow: 'hidden'
  },
  name: {
    color: '#00ff41',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  info: {
    color: '#ccc',
    fontSize: 14,
    marginVertical: 2
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30
  },
  editBtn: {
    backgroundColor: '#9b4dca',
    flex: 1
  },
  deleteBtn: {
    backgroundColor: '#ff4444',
    flex: 1
  },
  form: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff41'
  },
  input: {
    backgroundColor: '#0a0a0a',
    color: '#00ff41',
    borderWidth: 1,
    borderColor: '#9b4dca',
    borderRadius: 8,
    marginVertical: 5,
    padding: 12,
    fontSize: 14
  },
  saveBtn: {
    backgroundColor: '#00ff41',
    marginTop: 15
  },
  cancelBtn: {
    marginTop: 10,
    borderColor: '#ff4444'
  }
});