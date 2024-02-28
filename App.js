// App.js

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DBProvider } from './DBContext';
import UsersScreen from './components/UsersScreen';
import AddUserScreen from './components/AddUserScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <DBProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Users">
          <Stack.Screen name="Users" component={UsersScreen} options={{ title: 'Usuarios' }} />
          <Stack.Screen name="AddUser" component={AddUserScreen} options={{ title: 'Agregar Usuario' }} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </DBProvider>
  );
}