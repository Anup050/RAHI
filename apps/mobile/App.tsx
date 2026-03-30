import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home, Stethoscope, User, Clock, Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SymptomScreen from './src/screens/SymptomScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

import './src/i18n';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AppContent() {
  const { token, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* Temporarily Bypassing Auth for Demo if Token Logic is broken, 
          but keeping structure. User likely wants to see the Patient App immediately. 
          Assuming 'token' might be null initially. */}
      {token ? ( 
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#0284c7',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: { 
                height: 65, 
                paddingBottom: 10, 
                paddingTop: 10,
                backgroundColor: 'white',
                borderTopWidth: 1,
                borderTopColor: '#f1f5f9'
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500'
            }
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{
                tabBarLabel: t('home'),
                tabBarIcon: ({ color, size }: { color: string; size: number }) => <Home color={color} size={size} />
            }}
          />
          <Tab.Screen 
            name="Reminders" 
            component={RemindersScreen} 
            options={{
                tabBarLabel: t('reminders'),
                tabBarIcon: ({ color, size }: { color: string; size: number }) => <Clock color={color} size={size} />
            }}
          />
          <Tab.Screen 
            name="Appointments" 
            component={AppointmentsScreen} 
            options={{
                tabBarLabel: t('appointments') || "Appointments",
                tabBarIcon: ({ color, size }: { color: string; size: number }) => <Calendar color={color} size={size} />
            }}
          />
          <Tab.Screen 
            name="Symptoms" 
            component={SymptomScreen} 
            options={{
                tabBarLabel: t('symptoms'),
                tabBarIcon: ({ color, size }: { color: string; size: number }) => <Stethoscope color={color} size={size} />
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{
                tabBarLabel: t('profile'),
                tabBarIcon: ({ color, size }: { color: string; size: number }) => <User color={color} size={size} />
            }}
          />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
           <Stack.Screen name="Login" component={LoginScreen} />
           <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
