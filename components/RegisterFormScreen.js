import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, Alert, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import backgroundImage from '../assets/background.png';
import { apiurl } from '../apiContext';
import { useFocusEffect } from '@react-navigation/native';

export default function RegisterFormScreen(props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
        Alert.alert('Error', 'Por favor, completa todos los campos.');
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        Alert.alert('Error', 'Por favor, introduce un email válido.');
        return;
    }

    try {
        const response = await fetch(`${apiurl}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to create user');
        }

        setName('');
        setEmail('');
        setPassword('');
        props.navigation.goBack();

        Alert.alert('Éxito', 'Verifica tu email para activar tu cuenta.');

    } catch (error) {
        console.error(error);
        Alert.alert('Error', error.message || 'Ha ocurrido un error al registrar el usuario. Por favor, inténtalo de nuevo.');
    }
};

  const handleBack = () => {
    props.navigation.goBack();
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

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={text => setName(text)}
      />
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
        <TouchableOpacity style={styles.togglePasswordButton} onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBack}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'cover',
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
    flexDirection: 'row',
    alignItems: 'center',
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
  registerButton: {
    backgroundColor: '#4CAF50'
  },
  backButton: {
    marginRight: 5,
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
