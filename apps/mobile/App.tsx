import React from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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
import LanguagePickerScreen from './src/screens/LanguagePickerScreen';
import MedicalHistoryScreen from './src/screens/MedicalHistoryScreen';
import DoctorSelectionScreen from './src/screens/DoctorSelectionScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

import './src/i18n';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import PagerView from 'react-native-pager-view';

const Stack = createNativeStackNavigator();

function MainTabsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const pagerRef = React.useRef<PagerView>(null);
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = [
    { name: 'Home', component: HomeScreen, icon: Home, label: t('home') },
    { name: 'Reminders', component: RemindersScreen, icon: Clock, label: t('reminders') },
    { name: 'Appointments', component: AppointmentsScreen, icon: Calendar, label: t('appointments') || 'Appointments' },
    { name: 'Symptoms', component: SymptomScreen, icon: Stethoscope, label: t('symptoms') },
    { name: 'Profile', component: ProfileScreen, icon: User, label: t('profile') },
  ];

  const buildNav = (index: number) => ({
    navigate: (screenName: string, params?: any) => {
      // Check if it's a stack screen (full-screen modal)
      if (screenName === 'LanguagePicker' || screenName === 'MedicalHistory' || screenName === 'DoctorSelection' || screenName === 'Notifications') {
        navigation.navigate(screenName, params);
        return;
      }
      // Otherwise switch PagerView page
      const targetIndex = tabs.findIndex((t) => t.name === screenName);
      if (targetIndex !== -1) {
        setActiveTab(targetIndex);
        pagerRef.current?.setPage(targetIndex);
      }
    },
    goBack: () => navigation.goBack(),
    addListener: () => () => {},
  });

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >
        {tabs.map((tab, index) => {
          const ScreenComponent = tab.component;
          return (
            <View key={index} style={{ flex: 1 }}>
              <ScreenComponent navigation={buildNav(index)} />
            </View>
          );
        })}
      </PagerView>

      {/* Custom Bottom Bar */}
      <View
        style={{
          height: 65,
          flexDirection: 'row',
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingBottom: 10,
          paddingTop: 10,
        }}
      >
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
              <Text
                style={{
                  fontSize: 12,
                  color: isActive ? '#0284c7' : '#94a3b8',
                  fontWeight: isActive ? '600' : '400',
                  marginTop: 2,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

import { notificationService } from './src/services/notifications';

function AppContent() {
  const { token, isLoading } = useAuth();

  React.useEffect(() => {
    notificationService.init();
    if (token) {
      notificationService.registerForPushNotificationsAsync();
    }
  }, [token]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabsScreen} />
          <Stack.Screen name="LanguagePicker" component={LanguagePickerScreen} />
          <Stack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
          <Stack.Screen name="DoctorSelection" component={DoctorSelectionScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
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
