import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../context/AuthContext';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import TablesScreen from '../screens/TablesScreen';
import TableCrudScreen from '../screens/TableCrudScreen';
import MenuCrudScreen from '../screens/MenuCrudScreen';
import BillingScreen from '../screens/BillingScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ route }) => {
  const { user } = useAuth ? useAuth() : {};
  const rawRole = route?.params?.role || user?.role || 'user';
  const isAdmin = String(rawRole).trim().toUpperCase() === 'ADMIN';

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF7622',
        tabBarInactiveTintColor: '#8D96AA',
        tabBarStyle: {
          backgroundColor: '#070E20',
          borderTopColor: '#101A31',
          height: Platform.OS === 'ios' ? 80 : 68,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          paddingBottom: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        initialParams={{ role: rawRole }}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" color={color} size={size || 22} />
          ),
        }}
      />

      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        initialParams={{ role: rawRole }}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" color={color} size={size || 22} />
          ),
        }}
      />

      <Tab.Screen
        name="Tables"
        component={isAdmin ? TableCrudScreen : TablesScreen}
        initialParams={{ role: rawRole }}
        options={{
          tabBarLabel: 'Tables',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size || 22} />
          ),
        }}
      />

      <Tab.Screen
        name="Menu"
        component={MenuCrudScreen}
        initialParams={{ role: rawRole }}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" color={color} size={size || 22} />
          ),
        }}
      />

      <Tab.Screen
        name="Billing"
        component={BillingScreen}
        initialParams={{ role: rawRole }}
        options={{
          tabBarLabel: 'Billing',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card-outline" color={color} size={size || 22} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;