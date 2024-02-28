// components/AddUserScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Text, Alert } from 'react-native';
import { useDB } from '../DBContext';
import { useFocusEffect } from '@react-navigation/native';


export default function AddUserScreen(props) {
  const db = useDB();
  const [currentName, setCurrentName] = useState('');
  const [names, setNames] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM users', null, (_, resultSet) => setNames(resultSet.rows._array));
    });
  }, []);


  const addName = () => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO users (name) values (?)', [currentName],
        (txObj, resultSet) => {
          let existingNames = [...names];
          existingNames.push({ id: resultSet.insertId, name: currentName});
          setNames(existingNames);
          setCurrentName(undefined);
        },
        (txObj, error) => console.log(error)
      );
    });
  }

  const tryDeleteName = (id) => {
    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que deseas eliminar a esta pesona?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => deleteName(id) }
      ]
    );
  };

  const deleteName = (id) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM users WHERE id = ?', [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingNames = [...names].filter(name => name.id !== id);
            setNames(existingNames);
          }
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  const updateName = (id) => {
    db.transaction(tx => {
      tx.executeSql('UPDATE users SET name = ? WHERE id = ?', [currentName, id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingNames = [...names];
            const indexToUpdate = existingNames.findIndex(name => name.id === id);
            existingNames[indexToUpdate].name = currentName;
            setNames(existingNames);
            setCurrentName(undefined);
          }
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  const showNames = () => {
    return names.map((name, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.name}>{name.name}</Text>
        <View style={styles.buttonContainer}>
          <Button title="Update" onPress={() => updateName(name.id)} style={styles.button} />
          <View style={styles.buttonSpacer} />
          <Button title="Delete" onPress={() => tryDeleteName(name.id)} style={styles.button} />
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={currentName}
        placeholder="Nombre"
        onChangeText={setCurrentName}
        style={styles.input}
      />
      <Button title="Añadir Nombre" onPress={addName} />
      {showNames()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
    width: '80%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginHorizontal: 4,
  },
  buttonSpacer: {
    width: 8,
  },
});
