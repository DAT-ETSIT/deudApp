import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ScrollView, ImageBackground } from 'react-native';
import { apiurl } from '../apiContext';
import backgroundImage from '../assets/background.png';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; // Importa FontAwesome desde el paquete @expo/vector-icons

export default function ManageUserScreen(props) {
  const [currentName, setCurrentName] = useState('');
  const [names, setNames] = useState([]);
  const [showAddButton, setShowAddButton] = useState(true);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, [])
  );

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiurl}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setNames(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addName = async () => {
    if (!currentName.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    try {
      const response = await fetch(`${apiurl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: currentName }),
      });
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      setCurrentName('');
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const tryDeleteName = (id) => {
    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que deseas eliminar a esta persona?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => deleteName(id) }
      ]
    );
  };

  const deleteName = async (id) => {
    try {
      const response = await fetch(`${apiurl}/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const updateName = async (id) => {
    if (!currentName.trim()) {
      const nameToUpdate = names.find(name => name.id === id);
      setCurrentName(nameToUpdate.name);
      setShowAddButton(false);
      setCurrentId(id);
      return;
    }

    try {
      const response = await fetch(`${apiurl}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: currentName }),
      });
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      setCurrentName('');
      setShowAddButton(true);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const showNames = () => {
    return names.map((name, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.name}>{name.name}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => updateName(name.id)}>
            <Text style={styles.buttonText}>Actualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => tryDeleteName(name.id)}>
            <FontAwesome name="trash" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.inputRow}>
          <TextInput
            value={currentName}
            placeholder="Nombre"
            onChangeText={setCurrentName}
            style={styles.input}
          />
          {showAddButton && (
            <TouchableOpacity style={styles.addButton} onPress={addName}>
              <Text style={styles.buttonText}>Añadir</Text>
            </TouchableOpacity>
          )}
          {!showAddButton && currentId && (
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => updateName(currentId)}
            >
              <Text style={styles.buttonText}>Actualizar</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.masterCell}>Usuarios</Text>
          </View>
          {showNames()}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 8,
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: 'green', // Color del botón de añadir
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.3,
  },
  updateButton: {
    backgroundColor: 'blue', // Color del botón de actualizar
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.3,
  },
  table: {
    width: '90%',
    marginTop: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'black',
    marginBottom: 8,
    paddingBottom: 8,
  },
  name: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'lightblue', // Color del botón de actualizar
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: 'red', // Color del botón de borrar
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterCell: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
