// components/UsersScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('perico.db');

export default function UsersScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [names, setNames] = useState([]);
  const [currentName, setCurrentName] = useState('');

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
      tx.executeSql('SELECT * FROM users', null, (_, resultSet) => setNames(resultSet.rows._array));
    });
    setIsLoading(false);
  }, []);

  const addName = () => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO users (name) values (?)', [currentName], () => {
        setNames([...names, { name: currentName }]);
        setCurrentName('');
      });
    });
  }

  const showNames = () => {
    return names.map((name, index) => {
      return (
        <TouchableOpacity key={index} style={styles.button}>
          <Text style={styles.buttonText}>{name.name}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Agregar Usuario" onPress={() => navigation.navigate('AddUser')} />
      {showNames()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
