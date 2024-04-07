import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import backgroundImage from '../assets/background.png';
import { apiurl } from '../apiContext';
import { useFocusEffect } from '@react-navigation/native';

export default function ManageProductsScreen(props) {
  const [products, setProducts] = useState([]);
  const [amount, setAmount] = useState([]);
  const userId = props.route.params.name.id;
  const userName = props.route.params.name.name;
  
  useEffect(() => {
    fetch(`${apiurl}/products`)
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
    
    // Obtener cantidades desde la API
    fetch(`${apiurl}/transactions/user/${userId}`)
      .then(response => response.json())
      .then(data => setAmount(data))
      .catch(error => console.error('Error fetching transactions:', error));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetch(`${apiurl}/products`)
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
    
    // Obtener cantidades desde la API
    fetch(`${apiurl}/transactions/user/${userId}`)
      .then(response => response.json())
      .then(data => setAmount(data))
      .catch(error => console.error('Error fetching transactions:', error));
    }, [])
  );

  const addItem = (productId, button) => {
    const type = button === '+' ? '+' : '-';
    const currentDate = new Date().toISOString().replace(/\D/g, '');

    if (type === '-' && ((amount.find(item => item.id === productId)?.count === 0) || !amount.some(item => item.id === productId))) {
      return;
    }

    // Crear una nueva transacción
    fetch(`${apiurl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: userId,
        product: productId,
        date: currentDate,
        type,
        generated_by: null
      }),
    })
    .then(response => response.json())
    .then(() => {
      setAmount(prevAmount => {
        const updatedAmount = [...prevAmount];
        const productIndex = updatedAmount.findIndex(item => item.id === productId);
        if (productIndex !== -1) {
          updatedAmount[productIndex].count += (type === '+' ? 1 : -1);
        } else {
          updatedAmount.push({ id: productId, count: (type === '+' ? 1 : -1) });
        }
        return updatedAmount;
      });
    })
    .catch(error => console.error('Error creating transaction:', error));
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
                <Text style={styles.quantity}>
                  {amount.find(item => item.id === product.id)?.count || 0}
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
    fontSize: 24,
    marginBottom: 20,
  },
  productList: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '88%',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
  },
  productPrice: {
    fontSize: 16,
    marginLeft: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    margin: 5,
  },
  quantityButtonLess: {
    fontSize: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFB3B3',
    color: '#FFF',
    marginHorizontal: 5,
  },
  quantityButtonMore: {
    fontSize: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    color: '#FFF',
    marginHorizontal: 5,
  },
  quantity: {
    fontSize: 16,
    paddingHorizontal: 5,
    fontWeight: 'bold',
  },
});
