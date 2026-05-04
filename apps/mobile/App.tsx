import React from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
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

import PagerView from 'react-native-pager-view';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AppContent() {
  const { token, isLoading } = useAuth();
  const { t } = useTranslation();
  const pagerRef = React.useRef<PagerView>(null);
  const [activeTab, setActiveTab] = React.useState(0);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  const tabs = [
    { name: 'Home', component: HomeScreen, icon: Home, label: t('home') },
    { name: 'Reminders', component: RemindersScreen, icon: Clock, label: t('reminders') },
    { name: 'Appointments', component: AppointmentsScreen, icon: Calendar, label: t('appointments') || "Appointments" },
    { name: 'Symptoms', component: SymptomScreen, icon: Stethoscope, label: t('symptoms') },
    { name: 'Profile', component: ProfileScreen, icon: User, label: t('profile') },
  ];

  return (
    <NavigationContainer>
      {token ? ( 
        <View style={{ flex: 1 }}>
          <PagerView 
            style={{ flex: 1 }} 
            initialPage={0} 
            ref={pagerRef}
            onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
          >
            {tabs.map((tab, index) => {
              const ScreenComponent = tab.component;
              const mockNavigation = {
                navigate: (screenName: string) => {
                  const targetIndex = tabs.findIndex(t => t.name === screenName);
                  if (targetIndex !== -1) {
                    setActiveTab(targetIndex);
                    pagerRef.current?.setPage(targetIndex);
                  }
                },
                goBack: () => {
                  // Fallback for goBack if needed
                }
              };

              return (
                <View key={index} style={{ flex: 1 }}>
                  <ScreenComponent navigation={mockNavigation} />
                </View>
              );
            })}
          </PagerView>
          
          {/* Custom Bottom Bar */}
          <View style={{ 
            height: 65, 
            flexDirection: 'row', 
            backgroundColor: 'white', 
            borderTopWidth: 1, 
            borderTopColor: '#f1f5f9',
            paddingBottom: 10,
            paddingTop: 10
          }}>
            {tabs.map((tab, index) => {
              const isActive = activeTab === index;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => {
                    setActiveTab(index);
                    pagerRef.current?.setPage(index);
                  }}
                >
                  <tab.icon color={isActive ? '#0284c7' : '#94a3b8'} size={24} />
                  <Text style={{ 
                    fontSize: 12, 
                    color: isActive ? '#0284c7' : '#94a3b8',
                    fontWeight: isActive ? '600' : '400',
                    marginTop: 2
                  }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
