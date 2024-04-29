import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ImageBackground, BackHandler, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import backgroundImage from '../assets/background.png';
import backgroundNanoImage from '../assets/background-nano.png';
import { apiurl, useDB, getSessionToken } from '../apiContext';

export default function DebtsScreen(props) {
  const [debtData, setDebtData] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [daysSinceLastReset, setDaysSinceLastReset] = useState(null);
  const [password, setPassword] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(null);
  const [backgroundImageSource, setBackgroundImageSource] = useState(backgroundImage);
  const [isNanoBackground, setIsNanoBackground] = useState(false);
  const [user, setUser] = useState(null);
  const db = useDB();
  const [token, setToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // Estado para controlar el estado de actualización

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const sessionToken = await getSessionToken();
        setToken(sessionToken);
      } catch (error) {
        console.error('Error al obtener el token de sesión:', error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    checkLogin();
  }, [token]);

  useFocusEffect(
    React.useCallback(() => {
      checkLogin();
    }, [])
  );

  const checkLogin = async () => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS session (id INTEGER PRIMARY KEY, sessionToken TEXT)');
      tx.executeSql('SELECT sessionToken FROM session WHERE id=1', null, async (_, resultSet) => {
        if (!resultSet.rows.length > 0) {
          props.navigation.navigate('Login');
        }
        else {
          const firstSessionToken = resultSet.rows.item(0).sessionToken;
          try {
            const response = await fetch(`${apiurl}/users/${firstSessionToken}`);
            if (!response.ok) {
              throw new Error('Failed to fetch user data');
            }
            const userData = await response.json();
            setUser(userData);
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch user data');
          }
          fetchDebts(resultSet.rows.item(0).sessionToken);
          calculateDaysSinceLastReset(resultSet.rows.item(0).sessionToken);
        }
      });
    });
  };

  const fetchDebts = (token) => {
    fetch(`${apiurl}/debts`, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      const filteredData = data.filter(item => item.User !== null);
      setDebtData(filteredData);
      const total = filteredData.reduce((acc, curr) => {
        if (curr.debt !== null && !isNaN(curr.debt)) {
          return acc + parseFloat(curr.debt);
        } else {
          return acc;
        }
      }, 0);
      setTotalDebt(total);
    })
    .catch(error => console.error('Error fetching debts:', error))
    .finally(() => setRefreshing(false)); // Detener la animación de actualización
  };

  const handleReset = () => {
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
    if (password.trim() !== 'perico321') {
      Alert.alert('Error', 'Contraseña incorrecta.');
      return;
    }

    fetch(`${apiurl}/resets`, {
      method: 'POST',
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generated_by: user.email
      }),
    })
    .then(response => {
      if (response.ok) {
        setPassword('');
        fetchDebts(token);
        calculateDaysSinceLastReset(token);
      } else {
        console.error('Error al realizar el reset.');
      }
    })
    .catch(error => console.error('Error al realizar el reset:', error));
  };

  const calculateDaysSinceLastReset = (token) => {
    fetch(`${apiurl}/resets`, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    })
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
  

  const handleBackgroundPress = () => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;

    if (timeDiff > 300) {
      setClickCount(1);
    } else {
      setClickCount(prevCount => prevCount + 1);
    }

    setLastClickTime(currentTime);

    if (clickCount >= 4 && !isNanoBackground) {
      setBackgroundImageSource(backgroundNanoImage);
      setIsNanoBackground(true);
      setClickCount(0);
    } else if (clickCount >= 4 && isNanoBackground) {
      setBackgroundImageSource(backgroundImage);
      setIsNanoBackground(false);
      setClickCount(0);
    }
  };

  const closeSession = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar la sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql('DELETE FROM session WHERE id=1');
            });
            props.navigation.navigate('Home', { asd: 'asd' });
          }
        }
      ],
      { cancelable: false }
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress
      );

      return () => {
        backHandler.remove();
      };
    }, [])
  );

  const handleBackPress = () => {
    props.navigation.goBack(); // Vuelve atrás en la navegación
    return true; // Indica que el evento de retroceso ha sido manejado
  };

  const onRefresh = () => {
    setRefreshing(true); // Inicia la animación de actualización
    fetchDebts(token); // Llama a la función fetchDebts para actualizar la lista de deudas
  };

  return (
    <TouchableOpacity style={styles.background} onPress={handleBackgroundPress} activeOpacity={1}>
      <ImageBackground source={backgroundImageSource} style={styles.backgroundImage}>
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
          <ScrollView
            style={styles.debtList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            {debtData.map((item, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.userName}>{item.User}</Text>
                <Text style={styles.debtAmount}>{parseFloat(item?.debt).toFixed(2).replace('.', ',')} €</Text>
              </View>
            ))}
            <View style={styles.item}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalLabel}>{parseFloat(totalDebt)?.toFixed(2).replace('.', ',')} €</Text>
            </View>
          </ScrollView>
        </View>
        {isNanoBackground && (
          <View style={styles.textContainer}>
            <Text style={styles.names}>© Álvaro Rosado & Pablo Fernández</Text>
          </View>
        )}
        <View style={styles.logoutButtonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={closeSession}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Corregido
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
  debtList: {
    flex: 1,
    width: '90%',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10, // Añade un padding horizontal para separar los elementos
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
  textContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    padding: 10,
  },
  names: {
    fontSize: 14,
    textAlign: 'right',
  },
  logoutButtonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
