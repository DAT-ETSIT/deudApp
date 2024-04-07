import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import MainScreen from './components/MainScreen';
import ManageUserScreen from './components/ManageUserScreen';
import ManageProductsScreen from './components/ManageProductsScreen';
import DebtsScreen from './components/DebtsScreen';
import BoardScreen from './components/BoardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Main"
      component={MainScreen}
      options={{ title: 'Inicio', headerShown: false }}
    />
    <Stack.Screen
      name="Board"
      component={BoardScreen}
      options={{ title: 'Añadir Productos'}}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route, navigation }) => ({
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            display: 'flex',
            paddingBottom: 5,
            paddingTop: 5
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Users') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Products') {
              iconName = focused ? 'cube' : 'cube-outline';
            } else if (route.name === 'Debts') {
              iconName = focused ? 'cash' : 'cash-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Inicio' }} />
        <Tab.Screen name="Users" component={ManageUserScreen} options={{ title: 'Usuarios' }} />
        <Tab.Screen name="Products" component={ManageProductsScreen} options={{ title: 'Productos' }} />
        <Tab.Screen name="Debts" component={DebtsScreen} options={{ title: 'Deudas' }} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
