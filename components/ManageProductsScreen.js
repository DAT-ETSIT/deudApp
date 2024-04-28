import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ScrollView, ImageBackground, BackHandler, RefreshControl } from 'react-native';
import { apiurl, useDB, getSessionToken } from '../apiContext';
import backgroundImage from '../assets/background.png';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function ManageProductsScreen(props) {
  const [currentProductName, setCurrentProductName] = useState('');
  const [currentProductPrice, setCurrentProductPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [showAddButton, setShowAddButton] = useState(true);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [currentProductUrl, setCurrentProductUrl] = useState('');
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
          fetchProducts(resultSet.rows.item(0).sessionToken);
        }
      });
    });
  };

  const fetchProducts = async (token) => {
    try {
      const response = await fetch(`${apiurl}/products`, {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false); // Detener la animación de actualización
    }
  };

  const addProduct = async () => {
    if (!currentProductName.trim() || !currentProductPrice.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    try {
      const response = await fetch(`${apiurl}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: currentProductName, price: parseFloat(currentProductPrice.replace(',', '.')), photoUrl: currentProductUrl }),
      });
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add product');
      }

      setCurrentProductName('');
      setCurrentProductPrice('');
      setCurrentProductUrl('');
      fetchProducts(token);
    } catch (error) {
      Alert.alert('Error', error.message || 'Ha ocurrido un error al agregar el producto. Por favor, inténtalo de nuevo.');
    }
  };

  const tryDeleteProduct = (id, productName) => {
    Alert.alert(
      'Confirmación',
      `¿Estás seguro de que deseas eliminar el producto ${productName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => deleteProduct(id) }
      ]
    );
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${apiurl}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${token}`,
        },
      });
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Failed to delete product');
      }
      fetchProducts(token);
    } catch (error) {
      Alert.alert('Error', error.message || 'Ha ocurrido un error al eliminar el producto. Por favor, inténtalo de nuevo.');
    }
  };

  const updateProduct = async (id) => {
    if (!currentProductName.trim() || !currentProductPrice.trim()) {
      const productToUpdate = products.find(product => product.id === id);
      setCurrentProductName(productToUpdate.name);
      setCurrentProductPrice(productToUpdate.price.toString());
      setCurrentProductUrl(productToUpdate.photoUrl);
      setShowAddButton(false);
      setCurrentProductId(id);
      setEditingProductId(id); // Establecer el ID del producto en edición
      return;
    }
    try {
      const response = await fetch(`${apiurl}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify({ name: currentProductName, price: parseFloat(currentProductPrice.replace(',', '.')), photoUrl: currentProductUrl }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Failed to update product');
      }
      setCurrentProductName('');
      setCurrentProductPrice('');
      setCurrentProductUrl('');
      setShowAddButton(true);
      setEditingProductId(null);
      fetchProducts(token);
    } catch (error) {
      Alert.alert('Error', error.message || 'Ha ocurrido un error al actualizar el producto. Por favor, inténtalo de nuevo.');
    }
  };

  const showProducts = () => {
    return products.map((product, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.cell}>{product.name}</Text>
        <Text style={[styles.cell, styles.priceCell]}>{parseFloat(product?.price)?.toFixed(2).replace('.', ',')} €</Text>
        <View style={styles.buttonContainer}>
          {editingProductId === product.id ? ( // Mostrar solo el botón de edición si el producto está en modo de edición
            <TouchableOpacity style={styles.button} onPress={() => updateProduct(product.id)}>
              <FontAwesome name="edit" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, { opacity: editingProductId ? 0.3 : 1 }]} onPress={() => updateProduct(product.id)} disabled={editingProductId !== null}>
              <FontAwesome name="edit" size={20} color="white" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.deleteButton} onPress={() => tryDeleteProduct(product.id, product.name)} disabled={editingProductId !== null}>
            <FontAwesome name="trash" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    ));
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
    fetchProducts(token); // Llama a la función fetchProducts para actualizar la lista de productos
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.inputRow}>
          <TextInput
            value={currentProductName}
            placeholder="Producto"
            onChangeText={setCurrentProductName}
            style={[styles.input, styles.nameInput]}
          />
          <TextInput
            value={currentProductPrice}
            placeholder="Precio"
            onChangeText={setCurrentProductPrice}
            style={[styles.input, styles.priceInput]}
            keyboardType="numeric"
          />
          </View>
          <View style={styles.inputRow2}>
          <TextInput
            value={currentProductUrl}
            placeholder="Foto URL"
            onChangeText={setCurrentProductUrl}
            style={[styles.input, styles.nameInput]}
          />
          {showAddButton && (
            <TouchableOpacity style={styles.addButton} onPress={addProduct}>
              <MaterialIcons name="add-shopping-cart" size={24} color="white" />
            </TouchableOpacity>
          )}
          {!showAddButton && currentProductId && (
            <TouchableOpacity style={styles.updateButtonUpper} onPress={() => updateProduct(currentProductId)}>
              <FontAwesome name="edit" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          style={styles.table}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <View style={styles.row}>
            <Text style={styles.masterCell}>Productos</Text>
          </View>
          {showProducts()}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
    marginBottom: 10,
  },
  inputRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 8,
    flex: 1,
    marginRight: 10,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    marginTop: -10,
  },
  nameInput: {
    marginRight: 10,
  },
  priceInput: {
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.3,
  },
  updateButton: {
    backgroundColor: '#e4a11b', 
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  updateButtonUpper: {
    backgroundColor: '#4CAF50', 
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.3,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  table: {
    width: '90%',
    marginTop: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'black',
    marginBottom: 8,
    paddingBottom: 8,
  },
  cell: {
    fontSize: 16,
  },
  priceCell: {
    textAlign: 'left',
    paddingLeft: 20
  },
  masterCell: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#e4a11b',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
