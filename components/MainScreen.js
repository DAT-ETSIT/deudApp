// components/UsersScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Text, ImageBackground, ScrollView, Platform } from 'react-native';
import { apiurl, useDB } from '../apiContext';
import { useFocusEffect } from '@react-navigation/native';
import backgroundImage from '../assets/background.png';

export default function MainScreen(props) {

  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  
  //const test = { id: 1, name: 'Usuario 1' };
  const test = null;

  const db = useDB();

  useEffect(() => {
    checkLogin()
  }, []);

  useFocusEffect(() => {
    checkLogin()
  });

  const checkLogin = async () => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS session (id INTEGER PRIMARY KEY, sessionToken TEXT)');
      tx.executeSql('SELECT sessionToken FROM session WHERE id=1', null, async (_, resultSet) => {
        if (resultSet.rows.length > 0) {
          const firstSessionToken = resultSet.rows.item(0).sessionToken;
          try {
            const response = await fetch(`${apiurl}/users/${firstSessionToken}`);
            if (!response.ok) {
              throw new Error('Failed to fetch user data');
            }
            const userData = await response.json();
            setUser(userData);
            props.navigation.navigate('Board', { name: userData, externalEmail: userData.email });
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch user data');
          }
        } else {
          props.navigation.navigate('Login')
        }
      });
    });
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 42,
    width: '95%',
  },
  button: {
    backgroundColor: '#3f51b5',
    padding: 15,
    margin: 5,
    borderRadius: 15,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.55,
    shadowRadius: 3.84,
    elevation: 5,
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
