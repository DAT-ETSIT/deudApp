import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Text, Alert, ScrollView, ImageBackground } from 'react-native';
import { useDB } from '../DBContext';
import backgroundImage from '../assets/background.png';

export default function ManageUserScreen(props) {
  const db = useDB();
  const [currentName, setCurrentName] = useState('');
  const [names, setNames] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM users', null, (_, resultSet) => setNames(resultSet.rows._array));
    });
  }, []);

  const addName = () => {
    if (!currentName.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    db.transaction(tx => {
      tx.executeSql('INSERT INTO users (name) values (?)', [currentName],
        (txObj, resultSet) => {
          let existingNames = [...names];
          existingNames.push({ id: resultSet.insertId, name: currentName });
          setNames(existingNames);
          setCurrentName('');
        },
        (txObj, error) => console.log(error)
      );
    });
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
    if (!currentName.trim()) {
      const nameToUpdate = names.find(name => name.id === id);
      setCurrentName(nameToUpdate.name);
      return;
    }

    db.transaction(tx => {
      tx.executeSql('UPDATE users SET name = ? WHERE id = ?', [currentName, id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingNames = [...names];
            const indexToUpdate = existingNames.findIndex(name => name.id === id);
            existingNames[indexToUpdate].name = currentName;
            setNames(existingNames);
            setCurrentName('');
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
          <Button title="Actualizar" onPress={() => updateName(name.id)} style={styles.button} />
          <View style={styles.buttonSpacer} />
          <Button title="Borrar" onPress={() => tryDeleteName(name.id)} style={styles.button} />
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
          <Button title="Añadir Nombre" onPress={addName} style={styles.addButton} />
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
    marginHorizontal: 4,
  },
  buttonSpacer: {
    width: 8,
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
