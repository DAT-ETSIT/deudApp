// components/ManageUserScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Text, Alert } from 'react-native';
import { useDB } from '../DBContext';
import { useFocusEffect } from '@react-navigation/native';
import backgroundImage from '../assets/background.png';


export default function DebtsScreen(props) {


  return (
    <View style={styles.container}>
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
