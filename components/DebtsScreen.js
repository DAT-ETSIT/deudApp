// components/ManageUserScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Text, Alert, ImageBackground } from 'react-native';
import { useDB } from '../DBContext';
import { useFocusEffect } from '@react-navigation/native';
import backgroundImage from '../assets/background.png';

export default function DebtsScreen(props) {
  const db = useDB();
  const [debtData, setDebtData] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [daysSinceLastReset, setDaysSinceLastReset] = useState(null);

  useEffect(() => {
    fetchDebts();
    calculateDaysSinceLastReset();
  }, []);

  const fetchDebts = () => {
    db.transaction(tx => {
      // Obtener la fecha del último reset
      tx.executeSql(
        'SELECT date FROM reset ORDER BY id DESC LIMIT 1',
        [],
        (_, resetResultSet) => {
          if (resetResultSet.rows.length > 0) {
            const lastResetDate = resetResultSet.rows.item(0).date;
            tx.executeSql(
              `SELECT u.name AS user_name, 
                      SUM(CASE WHEN t.type = '+' THEN p.price ELSE -p.price END) AS debt 
               FROM transactions t
               JOIN users u ON t.user_id = u.id
               JOIN products p ON t.product_id = p.id
               WHERE t.date > ?
               GROUP BY t.user_id`,
              [lastResetDate],
              (_, resultSet) => {
                setDebtData(resultSet.rows._array);
                // Calcular el total de las deudas
                const total = resultSet.rows._array.reduce((acc, curr) => acc + curr.debt, 0);
                setTotalDebt(total);
              }
            );
          }
        }
      );
    });
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
    const currentDate = new Date().toISOString().replace(/\D/g, '');

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO reset (date) VALUES (?)',
        [currentDate],
        (_, resultSet) => {
          console.log('Reset realizado correctamente.');
          // Volver a cargar los datos después de realizar el reset
          fetchDebts();
          calculateDaysSinceLastReset();
        },
        error => console.error('Error al realizar el reset:', error)
      );
    });
  };

  const calculateDaysSinceLastReset = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT date FROM reset ORDER BY id DESC LIMIT 1', null, (_, resultSet) => {
        const lastResetStr = resultSet.rows.item(0).date;
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
      });
    });
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.resetContainer}>
          <Button title="Reset" onPress={handleReset} />
          <Text style={styles.daysSinceReset}>
            {daysSinceLastReset !== null ? `(${daysSinceLastReset} días desde el último reset)` : ''}
          </Text>
        </View>
        <Text style={styles.header}>Usuarios y Deudas:</Text>
        {debtData.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.userName}>{item.user_name}</Text>
            <Text style={styles.debtAmount}>{item.debt}€</Text>
          </View>
        ))}
        <View style={styles.item}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalLabel}>{totalDebt}€</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  daysSinceReset: {
    marginLeft: 10,
    fontSize: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
});
