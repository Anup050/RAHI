import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MedicationCard } from '../components/MedicationCard';
import { OfflineBanner } from '../components/OfflineBanner';

// Dummy Data
const INITIAL_MEDS = [
  { id: '1', name: 'Thyronorm', dosage: '25mcg, Empty Stomach', time: '7:00 AM', isTaken: true },
  { id: '2', name: 'Metformin', dosage: '500mg, After Lunch', time: '2:00 PM', isTaken: false },
  { id: '3', name: 'Atorvastatin', dosage: '10mg, Before Bed', time: '9:00 PM', isTaken: false }
];

export default function RemindersScreen() {
  const { t } = useTranslation();
  const [meds, setMeds] = useState(INITIAL_MEDS);

  const handleTake = (id: string) => {
    setMeds(prev => prev.map(med => 
        med.id === id ? { ...med, isTaken: true } : med
    ));
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <OfflineBanner />
      <View className="px-4 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-slate-900">{t('reminders')}</Text>
        <Text className="text-slate-500">Today, Dec 08</Text>
      </View>

      <ScrollView className="px-4 py-6">
        {/* Morning */}
        <View className="mb-6">
            <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Morning</Text>
            {meds.filter(m => m.id === '1').map(med => (
                <MedicationCard key={med.id} {...med} onTake={() => handleTake(med.id)} />
            ))}
        </View>

        {/* Afternoon */}
        <View className="mb-6">
            <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Afternoon</Text>
            {meds.filter(m => m.id === '2').map(med => (
                <MedicationCard key={med.id} {...med} onTake={() => handleTake(med.id)} />
            ))}
        </View>

        {/* Night */}
        <View className="mb-6">
            <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Night</Text>
            {meds.filter(m => m.id === '3').map(med => (
                <MedicationCard key={med.id} {...med} onTake={() => handleTake(med.id)} />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
