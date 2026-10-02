import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import TablesScreen from '../screens/TablesScreen';
import TableCrudScreen from '../screens/TableCrudScreen';
import MenuCrudScreen from '../screens/MenuCrudScreen';
import BillingScreen from '../screens/BillingScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ route }) => {
  const { user } = useAuth();
  const { colors } = useTheme(); // NEW
  const rawRole = route?.params?.role || user?.role || 'user';
  const isAdmin = String(rawRole).trim().toUpperCase() === 'ADMIN';

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.icon,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 76 : 74,
          paddingTop: 4,
          paddingBottom: Platform.OS === 'ios' ? 16 : 8,
          elevation: 9,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 1,
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