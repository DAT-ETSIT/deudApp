// components/UsersScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Text, ImageBackground } from 'react-native';
import { useDB } from '../DBContext';
import { useFocusEffect } from '@react-navigation/native';
import backgroundImage from '../assets/background.png';

export default function UsersScreen(props) {
  const db = useDB();
  const [isLoading, setIsLoading] = useState(true);
  const [names, setNames] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
      tx.executeSql('SELECT * FROM users', null, (_, resultSet) => setNames(resultSet.rows._array));
    });
    setIsLoading(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM users', null, (_, resultSet) => setNames(resultSet.rows._array));
      });
    }, [])
  );

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
    <ImageBackground source={require('../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        {showNames()}
        <Button title="GESTIÓN USUARIO" onPress={() => props.navigation.navigate('AddUser')} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%'
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
  background: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
