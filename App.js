// App.js

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Button, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DBProvider } from './DBContext';
import MainScreen from './components/MainScreen';
import ManageUserScreen from './components/ManageUserScreen';
import ManageProductsScreen from './components/ManageProductsScreen';
import DebtsScreen from './components/DebtsScreen';
import BoardScreen from './components/BoardScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <DBProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Users">
            <Stack.Screen name="Users" component={MainScreen} options={{ title: 'Usuarios' }} />
            <Stack.Screen name="ManageUser" component={ManageUserScreen} options={{ title: 'Administración de usuarios' }} />
            <Stack.Screen name="ManageProducts" component={ManageProductsScreen} options={{ title: 'Administración de productos' }} />
            <Stack.Screen name="Debts" component={DebtsScreen} options={{ title: 'Deudas' }} />
            <Stack.Screen name="Board" component={BoardScreen} options={{ title: 'Añadir Productos' }} />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
    </DBProvider>
  );
}