import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, Alert, BackHandler, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import backgroundImage from '../assets/background.png';
import { apiurl, useDB } from '../apiContext';
import { useFocusEffect, useRoute } from '@react-navigation/native';


export default function LoginFormScreen(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const db = useDB();

  const route = useRoute();
  const isHomeScreen = route.name === 'Login'; // Cambia 'Home' por el nombre de la pestaña de inicio

  useEffect(() => {
    const handleBackPress = () => {
      if (isHomeScreen) {
        if (backPressedOnce) {
          BackHandler.exitApp();
          return true;
        }

        backPressedOnce = true;
        ToastAndroid.show('Vuelve a pulsar atrás para salir', ToastAndroid.SHORT);

        setTimeout(() => {
          backPressedOnce = false;
        }, 2000); // Timeout to reset backPressedOnce after 2 seconds

        return true;
      }
      
      // If not in Home screen, just navigate back
      props.navigation.goBack();
      return true;
    };

    // Adding or removing event listener based on isHomeScreen value
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => {
      backHandler.remove(); // Removing event listener on component unmount
    };
  }, [isHomeScreen]);

  let backPressedOnce = false;

  const handleLogin = async () => {
    try {
        const response = await fetch(`${apiurl}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            } else {
                throw new Error('Failed to login');
            }
        }

        const token = responseData.sessionToken;

        db.transaction(tx => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS session (id INTEGER PRIMARY KEY, sessionToken TEXT)');
            tx.executeSql(
                'INSERT OR REPLACE INTO session (id, sessionToken) VALUES (?, ?)',
                [1, token],
                (_, result) => {
                }
            );
        });

        Alert.alert('Éxito', '¡Bienvenido de nuevo!');

    } catch (error) {
        console.error(error);
        Alert.alert('Error', error.message || 'Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
    props.navigation.navigate('Redirect');
};

  const handleRegister = () => {
    props.navigation.navigate('Register');
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          keyboardType="email-address"
          value={email}
          onChangeText={text => setEmail(text)}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={text => setPassword(text)}
          />
          <TouchableOpacity
            style={styles.togglePasswordButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
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
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  passwordContainer: {
    position: 'relative', 
    width: '80%', 
    marginBottom: 10,
  },
  passwordInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  togglePasswordButton: {
    position: 'absolute', 
    right: 10,
    top: '50%', 
    transform: [{ translateY: -12 }],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 5,
  },
  registerButton: {
    backgroundColor: 'tomato',
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
