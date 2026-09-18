import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Tab Navigator
import MainTabNavigator from './MainTabNavigator';

// Individual Operational Screens
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import TablesScreen from '../screens/TablesScreen';
import BillingScreen from '../screens/BillingScreen';

// Admin Management CRUD Flow
import EmployeeCrudScreen from '../screens/EmployeeCrudScreen';
import TableCrudScreen from '../screens/TableCrudScreen';
import MenuCrudScreen from '../screens/MenuCrudScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#070E20' },
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />

        {/* Main Tab Navigator */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />

        {/* Operational Flow */}
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
        <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
        <Stack.Screen name="TablesScreen" component={TablesScreen} />
        <Stack.Screen name="BillingScreen" component={BillingScreen} />

        {/* Admin Management CRUD Flow */}
        <Stack.Screen name="EmployeeCrudScreen" component={EmployeeCrudScreen} />
        <Stack.Screen name="TableCrudScreen" component={TableCrudScreen} />
        <Stack.Screen name="MenuCrudScreen" component={MenuCrudScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;