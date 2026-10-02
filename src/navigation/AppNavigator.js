import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MainTabNavigator from './MainTabNavigator';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import TablesScreen from '../screens/TablesScreen';
import BillingScreen from '../screens/BillingScreen';
import ProfileScreen from '../screens/ProfileScreen'; 

// Admin CRUD
import EmployeeCrudScreen from '../screens/EmployeeCrudScreen';
import TableCrudScreen from '../screens/TableCrudScreen';
import MenuCrudScreen from '../screens/MenuCrudScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, userToken, isLoading } = useAuth ? useAuth() : {};
  const [showSplash, setShowSplash] = React.useState(true);

  if (showSplash || isLoading) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#070E20' },
        }}
      >
        {!userToken ? (
          /* 🔴 Unauthenticated Flow (Splash, Login & Register) */
          <Stack.Group>
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          </Stack.Group>
        ) : (
          /* 🟢 Authenticated Flow (Dashboard & App Features) */
          <Stack.Group>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              initialParams={{ role: user?.role || 'user' }}
            />
            <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
            <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
            <Stack.Screen name="TablesScreen" component={TablesScreen} />
            <Stack.Screen name="BillingScreen" component={BillingScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} /> 
            
            <Stack.Screen name="EmployeeCrud" component={EmployeeCrudScreen} />
            <Stack.Screen name="EmployeeCrudScreen" component={EmployeeCrudScreen} />
            <Stack.Screen name="TableCrudScreen" component={TableCrudScreen} />
            <Stack.Screen name="MenuCrudScreen" component={MenuCrudScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;