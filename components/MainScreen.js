// components/UsersScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Text, ImageBackground, ScrollView } from 'react-native';
import { useDB } from '../DBContext';
import { useFocusEffect } from '@react-navigation/native';
import backgroundImage from '../assets/background.png';

export default function MainScreen(props) {
  const db = useDB();
  const [isLoading, setIsLoading] = useState(true);
  const [names, setNames] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
      tx.executeSql('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price DOUBLE)');
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
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Button title="GESTIÓN USUARIO" onPress={() => props.navigation.navigate('ManageUser')} />
          <Button title="GESTIÓN PRODUCTOS" onPress={() => props.navigation.navigate('ManageProducts')} />
          <Button title="DEUDAS" onPress={() => props.navigation.navigate('Debts')} />
        </View>
        <ScrollView contentContainerStyle={styles.namesContainer}>
          <View style={styles.namesWrapper}>
            {showNames()}
          </View>
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
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  namesContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  namesWrapper: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
});