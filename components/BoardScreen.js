import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Text, Alert, ScrollView, ImageBackground } from 'react-native';
import { useDB } from '../DBContext';
import { useFocusEffect } from '@react-navigation/native';
import backgroundImage from '../assets/background.png';

export default function ManageProductsScreen(props) {
  const db = useDB();
  const [products, setProducts] = useState([]);
  const [amount, setAmount] = useState([]);
  const userId = props.route.params.name.id;
  const userName = props.route.params.name.name;
  
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM products', null, (_, resultSet) => {
        setProducts(resultSet.rows._array);
      });
    });
  }, []);

  useEffect(() => {
    db.transaction(tx => {
      // Obtener la fecha del último reset
      tx.executeSql(
        'SELECT date FROM reset ORDER BY id DESC LIMIT 1',
        [],
        (_, resetResultSet) => {
          if (resetResultSet.rows.length > 0) {
            const lastResetDate = resetResultSet.rows.item(0).date;
            console.log(lastResetDate);
            // Luego, realizamos la consulta para obtener el amount
            tx.executeSql(
              `SELECT product_id, 
                      SUM(CASE WHEN type = '+' THEN 1 ELSE 0 END) - 
                      SUM(CASE WHEN type = '-' THEN 1 ELSE 0 END) AS cantidad 
               FROM transactions 
               WHERE user_id = ? AND date > ?
               GROUP BY product_id`,
              [userId, lastResetDate],
              (_, amountResultSet) => {
                setAmount(amountResultSet.rows._array);
              }
            );
          }
        }
      );
    });
  }, []);

  console.log(amount)
  
  
  
  const addItem = (productId, button) => {
    // Verificar si el botón es "-" y la cantidad actual es 0
    if (button === '-' && amount.find(item => item.product_id === productId)?.cantidad === 0) {
      return;
    }
    const currentDate = new Date().toISOString().replace(/\D/g, '');
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT INTO transactions (user_id, product_id, date, type) VALUES (?, ?, ?, ?)',
          [userId, productId, currentDate, button],
          (_, { insertId }) => {
            // Actualizar la cantidad en tiempo real sin hacer una nueva consulta
            setAmount(prevAmount => {
              const updatedAmount = [...prevAmount];
              const productIndex = updatedAmount.findIndex(item => item.product_id === productId);
              if (productIndex !== -1) {
                updatedAmount[productIndex].cantidad += (button === '+' ? 1 : -1);
              } else {
                // Si el producto no existe en amount, agregarlo con cantidad 1 o -1 según el botón
                updatedAmount.push({ product_id: productId, cantidad: (button === '+' ? 1 : -1) });
              }
              return updatedAmount;
            });
          },
          error => console.error('Error inserting transaction:', error)
        );
      },
    );
  };
    
  
    return (
      <ImageBackground source={backgroundImage} style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.userName}>{userName}</Text>
          <ScrollView contentContainerStyle={styles.productList}>
            {products.map((product, index) => (
              <View key={index} style={styles.productItem}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}€</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => addItem(product.id, '-')}>
                  <Text style={styles.quantityButtonLess}>-</Text>
                </TouchableOpacity>
                {/* Mostrar la cantidad dinámica obtenida del array amount */}
                <Text style={styles.quantity}>
                  {/* Buscar la cantidad correspondiente del producto actual */}
                  {amount.find(item => item.product_id === product.id)?.cantidad || 0}
                </Text>
                <TouchableOpacity onPress={() => addItem(product.id, '+')}>
                  <Text style={styles.quantityButtonMore}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            ))}
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
      width: '100%',
    },
    background: {
      flex: 1,
      resizeMode: 'cover',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userName: {
      fontSize: 24, // Tamaño de letra aumentado para el nombre de usuario
      marginBottom: 20, // Espacio adicional en la parte inferior
    },
    productList: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    productItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '80%',
      marginBottom: 10,
    },
    productNameContainer: {
      flex: 1, // Hace que el contenedor se expanda para ocupar el espacio disponible
    },
    productName: {
      fontSize: 16,
    },
    productPrice: {
      fontSize: 16,
      marginLeft: 10, // Espacio adicional a la izquierda del precio
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityButtonLess: {
      fontSize: 20,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: '#FFB3B3',
      color: '#FFF', // Texto blanco
      marginHorizontal: 5,
    },
    quantityButtonMore: {
      fontSize: 20,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: '#4CAF50',
      color: '#FFF', // Texto blanco
      marginHorizontal: 5,
    },
    quantity: {
      fontSize: 16,
      paddingHorizontal: 10,
    },
  });
  