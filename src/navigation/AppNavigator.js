import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
// Existing Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';// Updated import name if file is OrderScreen.js
import TablesScreen from '../screens/TablesScreen';
// Admin CRUD Screens
import EmployeeCrudScreen from '../screens/EmployeeCrudScreen';
import TableCrudScreen from '../screens/TableCrudScreen';
import MenuCrudScreen from '../screens/MenuCrudScreen';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="RegisterScreen" // Default to Dashboard for standard auth flow
        screenOptions={{
          headerShown: false,
         contentStyle: { backgroundColor: '#070E20' }, // Dark theme container background
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
       <Stack.Screen name="RegisterScreen" component={RegisterScreen} /> 


        {/* Operational Flow */}
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
       <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
        <Stack.Screen name="TablesScreen" component={TablesScreen} />

        {/* Admin Management CRUD Flow */}
        <Stack.Screen name="EmployeeCrudScreen" component={EmployeeCrudScreen} />
        <Stack.Screen name="TableCrudScreen" component={TableCrudScreen} />
        <Stack.Screen name="MenuCrudScreen" component={MenuCrudScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;