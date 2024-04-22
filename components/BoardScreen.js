import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ImageBackground, TouchableOpacity, FlatList, Image } from 'react-native';
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
    
    // Fetch amount from API
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
      
      // Fetch amount from API
      fetch(`${apiurl}/transactions/user/${userId}`)
        .then(response => response.json())
        .then(data => setAmount(data))
        .catch(error => console.error('Error fetching transactions:', error));
    }, [])
  );

  const handleIncrement = (productId) => {
    addItem(productId, '+');
  };

  const handleDecrement = (productId) => {
    addItem(productId, '-');
  };

  const addItem = (productId, button) => {
    const type = button === '+' ? '+' : '-';
    const currentDate = new Date().toISOString().replace(/\D/g, '');

    if (type === '-' && ((amount.find(item => item.id === productId)?.count === 0) || !amount.some(item => item.id === productId))) {
      return;
    }

    // Create a new transaction
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

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={ item.photoUrl ? { uri: item.photoUrl } : require('../assets/apple.png') } style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productPriceContainer}>
          <Text style={styles.productPrice}>{item.price.toFixed(2).replace('.', ',')} €</Text>
          <View style={styles.productAmount}>
            <TouchableOpacity onPress={() => handleDecrement(item.id)}>
              <Text style={styles.amountButton}>-</Text>
            </TouchableOpacity>
            <Text style={styles.amountText}>
              {amount.find(amountItem => amountItem.id === item.id)?.count || 0}
            </Text>
            <TouchableOpacity onPress={() => handleIncrement(item.id)}>
              <Text style={styles.amountButton}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.userName}>{userName}</Text>
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productList}
        />
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
    marginTop: 15,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  productList: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '88%',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: '#9D9D9D',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 8,
  },
  productAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  amountButton: {
    fontSize: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    color: '#FFF',
    marginHorizontal: 5,
    backgroundColor: '#FFA500'
  },
  amountText: {
    fontSize: 16,
    paddingHorizontal: 10,
  },
});