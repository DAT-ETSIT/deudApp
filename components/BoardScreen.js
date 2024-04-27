import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ImageBackground, TouchableOpacity, FlatList, Image } from 'react-native';
import backgroundImage from '../assets/background.png';
import { apiurl, useDB, getSessionToken } from '../apiContext';
import { useFocusEffect } from '@react-navigation/native';

export default function BoardScreen(props) {
  const [products, setProducts] = useState([]);
  const [amount, setAmount] = useState([]);
  const userId = props.route.params.name.id;
  const userName = props.route.params.name.name;
  const externalEmail = props.route.params.externalEmail || null;
  const db = useDB();
  const [token, setToken] = useState(null);


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
          fetchData(resultSet.rows.item(0).sessionToken);
        }
      });
    });
  };

  const fetchData = (token) => {
    // Fetch products with token in header
    fetch(`${apiurl}/products`, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => setProducts(data))
    .catch(error => console.error('Error fetching products:', error));

    // Fetch amount from API with token in header
    fetch(`${apiurl}/transactions/user/${userId}`, {
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      const parsedData = data.map(item => ({ ...item, count: parseInt(item.count, 10) }));
      setAmount(parsedData);
    })
    .catch(error => console.error('Error fetching transactions:', error));
  };

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
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: userId,
        product: productId,
        date: currentDate,
        type,
        generated_by: externalEmail
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
          <Text style={styles.productPrice}>{parseFloat(item?.price).toFixed(2).replace('.', ',')} €</Text>
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