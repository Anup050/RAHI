import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Languages, Activity, ChevronRight } from 'lucide-react-native';
import { EmergencyCard } from '../components/EmergencyCard';
import { MedicationCard } from '../components/MedicationCard';
import { OfflineBanner } from '../components/OfflineBanner';
import i18n from '../i18n';

import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth(); // Get user from context

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <OfflineBanner />
      
      <ScrollView className="px-4 py-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 text-lg font-medium">{t('welcome')},</Text>
            <Text className="text-slate-900 text-3xl font-bold">{user?.full_name || "Guest"}</Text>
          </View>
          <TouchableOpacity 
            onPress={toggleLanguage}
            className="bg-white p-2 rounded-full border border-gray-200 shadow-sm"
          >
            <Languages size={24} color="#0284c7" />
          </TouchableOpacity>
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
        <View className="mb-8">
          <Text className="text-slate-900 text-xl font-bold mb-4">{t('next_pill')}</Text>
          <MedicationCard 
            name="Metformin"
            dosage="500mg, After Lunch"
            time="2:00 PM"
            isTaken={false}
            onTake={() => console.log('Taken')}
          />
        </View>

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
