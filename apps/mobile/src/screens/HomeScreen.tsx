import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Languages, Activity, ChevronRight, Bell } from 'lucide-react-native';
import { EmergencyCard } from '../components/EmergencyCard';
import { MedicationCard } from '../components/MedicationCard';
import { OfflineBanner } from '../components/OfflineBanner';
import i18n from '../i18n';
import api from '../services/api';
import { Reminder } from './RemindersScreen';

import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth(); // Get user from context
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextPill, setNextPill] = useState<Reminder | null>(null);

  const fetchNotificationCount = async () => {
    try {
      const { data } = await api.get('/notifications');
      const unread = data.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    const fetchNextPill = async () => {
      try {
        const { data } = await api.get('/prescriptions/reminders');
        const reminders: Reminder[] = data;
        
        // Find the next untaken pill based on a simple time-of-day heuristic
        const hour = new Date().getHours();
        let targetTime = 'Morning';
        if (hour >= 12 && hour < 17) targetTime = 'Afternoon';
        else if (hour >= 17) targetTime = 'Night';

        const order = ['Morning', 'Afternoon', 'Night'];
        const startIndex = order.indexOf(targetTime);

        let found = null;
        for (let i = startIndex; i < order.length; i++) {
            found = reminders.find(r => r.time_of_day === order[i] && !r.is_taken);
            if (found) break;
        }

        // If not found today, we just don't show one or show the very first untaken one
        if (!found) {
            found = reminders.find(r => !r.is_taken);
        }
        
        setNextPill(found || null);
      } catch (error) {
        console.error('Error fetching next pill:', error);
      }
    };

    // Refetch when screen comes into focus
    let unsubscribe: any;
    if (navigation && navigation.addListener) {
      unsubscribe = navigation.addListener('focus', () => {
        if (user && user.role === 'patient') {
          fetchNextPill();
          fetchNotificationCount();
        }
      });
    }

    if (user && user.role === 'patient') {
        fetchNextPill();
        fetchNotificationCount();
    }

    // Poll for notifications every 30 seconds
    const interval = setInterval(() => {
        if (user && user.role === 'patient') {
            fetchNotificationCount();
        }
    }, 30000);

    return () => {
        if (unsubscribe) unsubscribe();
        clearInterval(interval);
    };
  }, [navigation, user]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <OfflineBanner />
      
      <ScrollView className="px-4 py-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <View className="flex-row items-center">
              <Text className="text-slate-500 text-lg font-medium">{t('welcome')},</Text>
              <View className="ml-2 bg-blue-100 px-2 py-0.5 rounded">
                <Text className="text-blue-700 text-[10px] font-bold">V1.1</Text>
              </View>
            </View>
            <Text className="text-slate-900 text-3xl font-bold">{user?.full_name || "Guest"}</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Notifications')}
              className="bg-white p-2 rounded-full border border-gray-200 shadow-sm mr-3 relative"
            >
              <Bell size={24} color="#0284c7" />
              {unreadCount > 0 && (
                <View className="absolute top-0 right-0 bg-red-500 w-4 h-4 rounded-full items-center justify-center border-2 border-white">
                   <Text className="text-white text-[8px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('LanguagePicker')}
              className="bg-white p-2 rounded-full border border-gray-200 shadow-sm"
            >
              <Languages size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Section */}
        <View className="mb-8">
          <EmergencyCard />
        </View>

        {/* Symptom Checker Shortcut */}
        <View className="mb-8">
            <Text className="text-slate-900 text-xl font-bold mb-4">{t('symptoms')}</Text>
            <TouchableOpacity 
                onPress={() => navigation.navigate('Symptoms')}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex-row items-center"
            >
                <View className="bg-blue-100 p-3 rounded-full mr-4">
                     <Activity size={24} color="#0284c7" />
                </View>
                <View className="flex-1">
                    <Text className="text-slate-900 font-bold text-lg">Check Symptoms</Text>
                    <Text className="text-slate-500">AI-powered diagnosis</Text>
                </View>
                <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>
        </View>

        {/* Next Pill Section */}
        {nextPill && (
            <View className="mb-8">
            <Text className="text-slate-900 text-xl font-bold mb-4">{t('next_pill')}</Text>
            <MedicationCard 
                id={nextPill.prescription_id.toString()}
                name={nextPill.medicine}
                dosage={nextPill.dosage}
                time={nextPill.time_of_day}
                isTaken={nextPill.is_taken}
                onTake={async () => {
                    try {
                        await api.post('/prescriptions/log', {
                            prescription_id: nextPill.prescription_id,
                            time_of_day: nextPill.time_of_day
                        });
                        setNextPill({ ...nextPill, is_taken: true });
                    } catch (e) {
                        console.error(e);
                    }
                }}
            />
            </View>
        )}

        {/* Recent Activity / Health Tips */}
        <View className="mb-8">
           <Text className="text-slate-900 text-xl font-bold mb-4">Health Insight</Text>
           <View className="bg-blue-600 rounded-2xl p-6 shadow-lg">
              <Text className="text-white text-lg font-bold mb-2">Keep Hydrated!</Text>
              <Text className="text-blue-100 leading-5">
                Drinking 8 glasses of water helps manage blood sugar levels effectively.
              </Text>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
