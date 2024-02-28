// components/AddUserScreen.js

import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useDB } from '../DBContext';


export default function AddUserScreen(props) {
  const db = useDB();
  const [currentName, setCurrentName] = useState('');

  const addName = () => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO users (name) values (?)', [currentName]);
    });
    props.navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <TextInput value={currentName} placeholder='Nombre' onChangeText={setCurrentName} style={styles.input} />
      <Button title="Añadir Nombre" onPress={addName} />
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
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
    width: '80%',
  },
});