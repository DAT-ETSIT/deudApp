// components/ManageUserScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Text, Alert, ImageBackground } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import backgroundImage from '../assets/background.png';
import { apiurl } from '../apiContext';

export default function DebtsScreen(props) {
  const [debtData, setDebtData] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [daysSinceLastReset, setDaysSinceLastReset] = useState(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchDebts();
    calculateDaysSinceLastReset();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchDebts();
      calculateDaysSinceLastReset();
    }, [])
  );

  const fetchDebts = () => {
    fetch(`${apiurl}/debts`)
      .then(response => response.json())
      .then(data => {
        const filteredData = data.filter(item => item.User !== null);
        setDebtData(filteredData);
        const total = filteredData.reduce((acc, curr) => acc + curr.debt, 0);
        setTotalDebt(total);
      })
      .catch(error => console.error('Error fetching debts:', error));
  };
  

  const handleReset = () => {
    // Mostrar una alerta para confirmar el reset
    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que quieres realizar el reset?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Aceptar',
          onPress: () => performReset(),
        },
      ],
      { cancelable: false }
    );
  };

  const performReset = () => {
    // Comprobar si la contraseña es correcta
    if (password.trim() !== 'perico321') {
      Alert.alert('Error', 'Contraseña incorrecta.');
      return;
    }

    // Realizar el reset si la contraseña es correcta
    fetch(`${apiurl}/resets`, {
      method: 'POST',
    })
      .then(response => {
        if (response.ok) {
          console.log('Reset realizado correctamente.');
          setPassword('');
          fetchDebts();
          calculateDaysSinceLastReset();
        } else {
          console.error('Error al realizar el reset.');
        }
      })
      .catch(error => console.error('Error al realizar el reset:', error));
  };

  const calculateDaysSinceLastReset = () => {
    fetch(`${apiurl}/resets`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          const lastResetStr = data.date;
          const currentDateStr = new Date().toISOString().replace(/\D/g, '');
          const currentDate = new Date(
            parseInt(currentDateStr.substring(0, 4)),
            parseInt(currentDateStr.substring(4, 6)) - 1,
            parseInt(currentDateStr.substring(6, 8)),
            parseInt(currentDateStr.substring(8, 10)),
            parseInt(currentDateStr.substring(10, 12)),
            parseInt(currentDateStr.substring(12, 14)),
            parseInt(currentDateStr.substring(14))
          );
    
          const lastResetDate = new Date(
            parseInt(lastResetStr.substring(0, 4)),
            parseInt(lastResetStr.substring(4, 6)) - 1,
            parseInt(lastResetStr.substring(6, 8)),
            parseInt(lastResetStr.substring(8, 10)),
            parseInt(lastResetStr.substring(10, 12)),
            parseInt(lastResetStr.substring(12, 14)),
            parseInt(lastResetStr.substring(14))
          );
    
          const differenceInMilliseconds = currentDate - lastResetDate;
          const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 3600 * 24));
          setDaysSinceLastReset(differenceInDays);
        }
      })
      .catch(error => console.error('Error fetching last reset:', error));
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.daysSinceReset}>
          {daysSinceLastReset !== null ? `${daysSinceLastReset} días desde el último reset` : '0 días desde el último reset'}
        </Text>
        <View style={styles.resetContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            secureTextEntry
          />
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>Usuarios y Deudas:</Text>
        {debtData.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.userName}>{item.User}</Text>
            <Text style={styles.debtAmount}>{item.debt.toFixed(2).replace('.', ',')} €</Text>
          </View>
        ))}
        <View style={styles.item}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalLabel}>{totalDebt.toFixed(2).replace('.', ',')} €</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'top',
    padding: 20,
    width: '85%',
  },
  resetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  daysSinceReset: {
    marginBottom: 2,
    fontSize: 10,
    alignSelf: 'flex-start',
    color: 'gray',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  resetButton: {
    backgroundColor: '#e4a11b',
    padding: 10,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});