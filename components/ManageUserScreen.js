import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ScrollView, ImageBackground } from 'react-native';
import { apiurl, useDB } from '../apiContext';
import backgroundImage from '../assets/background.png';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';

export default function ManageUserScreen(props) {
  const [currentName, setCurrentName] = useState('');
  const [names, setNames] = useState([]);
  const [showAddButton, setShowAddButton] = useState(true);
  const [currentId, setCurrentId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const db = useDB();

  useEffect(() => {
    checkLogin();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkLogin();
    }, [])
  );

  const checkLogin = async () => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS session (id INTEGER PRIMARY KEY, sessionToken TEXT)');
      tx.executeSql('SELECT sessionToken FROM session WHERE id=1', null, async (_, resultSet) => {
        if (!resultSet.rows.length > 0) {
          props.navigation.navigate('Login');
        }
        else {
          const firstSessionToken = resultSet.rows.item(0).sessionToken;
          try {
            const response = await fetch(`${apiurl}/users/${firstSessionToken}`);
            if (!response.ok) {
              throw new Error('Failed to fetch user data');
            }
            const userData = await response.json();
            setUser(userData);
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch user data');
          }
          fetchUsers();
        }
      });
    });
  };

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

  const tryDeleteName = (id, userName) => {
    Alert.alert(
      'Confirmación',
      `¿Estás seguro de que deseas eliminar al usuario ${userName}?`,
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
      setEditingId(id); // Establecer el ID del nombre en edición
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
      setEditingId(null); // Restablecer el ID del nombre en edición a null
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
          <TouchableOpacity style={styles.buttonCart} onPress={() => props.navigation.navigate('BoardManage', { name: name, externalEmail: user.email })}>
            <FontAwesome name="cart-plus" size={20} color="white" />
          </TouchableOpacity>
          {editingId === name.id ? ( // Mostrar solo el botón de edición si el nombre está en modo de edición
            <TouchableOpacity style={styles.button} onPress={() => updateName(name.id)} disabled={editingId !== name.id}>
              <FontAwesome name="edit" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, { opacity: editingId ? 0.3 : 1 }]} onPress={() => updateName(name.id)} disabled={editingId !== null}>
              <FontAwesome name="edit" size={20} color="white" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.deleteButton} onPress={() => tryDeleteName(name.id, name.name)} disabled={editingId !== null}>
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
          {!showAddButton && currentId && (
            <TouchableOpacity
              style={styles.updateButtonUpper}
              onPress={() => updateName(currentId)}
            >
              <FontAwesome name="edit" size={20} color="white" />
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
    backgroundColor: '#4CAF50', // Color del botón de añadir
    padding: 10,
    paddingHorizontal: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.3,
  },
  updateButton: {
    backgroundColor: '#e4a11b', // Color del botón de actualizar
    paddingHorizontal: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.3,
  },
  updateButtonUpper: {
    backgroundColor: '#4CAF50', // Color del botón de actualizar
    paddingHorizontal: 1,
    paddingVertical: 12,
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
    backgroundColor: '#e4a11b', // Color del botón de actualizar
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  buttonCart: {
    backgroundColor: '#e4a11b',
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
