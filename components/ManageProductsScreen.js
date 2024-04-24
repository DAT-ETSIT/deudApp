import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ScrollView, ImageBackground } from 'react-native';
import { apiurl, useDB } from '../apiContext';
import backgroundImage from '../assets/background.png';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function ManageProductsScreen(props) {
  const [currentProductName, setCurrentProductName] = useState('');
  const [currentProductPrice, setCurrentProductPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [showAddButton, setShowAddButton] = useState(true);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null); // Estado para almacenar el ID del producto en edición
  const db = useDB();

  useEffect(() => {
    checkLogin()
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkLogin()
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
          fetchProducts();
        }
      });
    });
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiurl}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: currentProductName, price: parseFloat(currentProductPrice.replace(',', '.')) }),
      });
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      setCurrentProductName('');
      setCurrentProductPrice('');
      fetchProducts();
    } catch (error) {
      console.error(error);
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
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const updateProduct = async (id) => {
    if (!currentProductName.trim() || !currentProductPrice.trim()) {
      const productToUpdate = products.find(product => product.id === id);
      setCurrentProductName(productToUpdate.name);
      setCurrentProductPrice(productToUpdate.price.toString());
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
        },
        body: JSON.stringify({ name: currentProductName, price: parseFloat(currentProductPrice.replace(',', '.')) }),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      setCurrentProductName('');
      setCurrentProductPrice('');
      setShowAddButton(true);
      setEditingProductId(null); // Restablecer el ID del producto en edición a null
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const showProducts = () => {
    return products.map((product, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.cell}>{product.name}</Text>
        <Text style={[styles.cell, styles.priceCell]}>{product.price.toFixed(2).replace('.', ',')} €</Text>
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
        <ScrollView style={styles.table}>
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
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 8,
    flex: 1,
    marginRight: 10,
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
