import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../context/AuthContext';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import TablesScreen from '../screens/TablesScreen';
import TableCrudScreen from '../screens/TableCrudScreen';
import OrdersScreen from '../screens/OrdersScreen';
import MenuCrudScreen from '../screens/MenuCrudScreen';
import BillingScreen from '../screens/BillingScreen';
import EmployeeCrudScreen from '../screens/EmployeeCrudScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ route }) => {
  const { user } = useAuth();
  const rawRole = user?.role || route?.params?.role || 'user';
  const isAdmin = String(rawRole).toLowerCase() === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF7622',
        tabBarInactiveTintColor: '#8D96AA',
        tabBarStyle: {
          backgroundColor: '#070E20',
          borderTopColor: '#101A31',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* 1. Menu Tab */}
      <Tab.Screen
        name="Menu"
        component={MenuCrudScreen}
        initialParams={{ role: rawRole }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" color={color} size={size || 20} />
          ),
        }}
      />

      {/* 2. Tables Tab */}
      <Tab.Screen
        name="Tables"
        component={isAdmin ? TableCrudScreen : TablesScreen}
        initialParams={{ role: rawRole }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size || 20} />
          ),
        }}
      />

      {/* 3. Orders Tab */}
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        initialParams={{ role: rawRole }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" color={color} size={size || 20} />
          ),
        }}
      />

      {/* 4. Billing Tab */}
      <Tab.Screen
        name="Billing"
        component={BillingScreen}
        initialParams={{ role: rawRole }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card-outline" color={color} size={size || 20} />
          ),
        }}
      />

      {/* 5. Employees Tab (Only for Admin) */}
      {isAdmin && (
        <Tab.Screen
          name="Employees"
          component={EmployeeCrudScreen}
          initialParams={{ role: rawRole }}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" color={color} size={size || 20} />
            ),
          }}
        />
      )}

      {/* 6. Dashboard Tab */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        initialParams={{ role: rawRole }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" color={color} size={size || 20} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;