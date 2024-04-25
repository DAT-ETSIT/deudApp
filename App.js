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
import LoginFormScreen from './components/LoginFormScreen';
import RegisterScreen from './components/RegisterFormScreen';

import { DBProvider } from './apiContext';
import LoginRedirect from './components/LoginRedirect';

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
      options={{ title: 'Añadir Productos', headerShown: false}}
    />
    <Stack.Screen
      name="Redirect"
      component={LoginRedirect}
      options={{ title: 'Redirect', headerShown: false}}
    />
  </Stack.Navigator>
);

const ManageUserStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ManageUsers"
      component={ManageUserScreen}
      options={{ title: 'Usuarios', headerShown: false }}
    />
    <Stack.Screen
      name="BoardManage"
      component={BoardScreen}
      options={{ title: 'Añadir Productos', headerShown: false}}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <DBProvider>
      <NavigationContainer>
        <Stack.Navigator headerShown="false">
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginFormScreen}
            options={{ title: 'Login', headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Register', headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </DBProvider>
  );
}

const MainTabs = () => (
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
    <Tab.Screen name="Users" component={ManageUserStack} options={{ title: 'Usuarios' }} />
    <Tab.Screen name="Products" component={ManageProductsScreen} options={{ title: 'Productos' }} />
    <Tab.Screen name="Debts" component={DebtsScreen} options={{ title: 'Deudas' }} />
  </Tab.Navigator>
);
