import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MedicationCard } from '../components/MedicationCard';
import { OfflineBanner } from '../components/OfflineBanner';
import api from '../services/api';

export interface Reminder {
  prescription_id: number;
  medicine: string;
  dosage: string;
  time_of_day: string;
  is_taken: boolean;
}

export default function RemindersScreen() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReminders = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get('/prescriptions/reminders');
      setReminders(data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleTake = async (prescriptionId: number, timeOfDay: string) => {
    try {
      await api.post('/prescriptions/log', {
        prescription_id: prescriptionId,
        time_of_day: timeOfDay
      });
      // Update local state immediately
      setReminders(prev => prev.map(r => 
        (r.prescription_id === prescriptionId && r.time_of_day === timeOfDay) 
          ? { ...r, is_taken: true } : r
      ));
    } catch (error) {
      console.error('Error logging pill:', error);
      alert('Failed to log medication. Please try again.');
    }
  };

  const getRemindersByTime = (time: string) => reminders.filter(r => r.time_of_day === time);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <OfflineBanner />
      <View className="px-4 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-slate-900">{t('reminders')}</Text>
        <Text className="text-slate-500">Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
      </View>

      <ScrollView 
        className="px-4 py-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchReminders} />}
      >
        {reminders.length === 0 && !refreshing ? (
          <View className="items-center mt-10">
            <Text className="text-slate-500">No active medications for today.</Text>
          </View>
        ) : null}

        {/* Morning */}
        {getRemindersByTime('Morning').length > 0 && (
            <View className="mb-6">
                <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Morning</Text>
                {getRemindersByTime('Morning').map(med => (
                    <MedicationCard 
                        key={`${med.prescription_id}-morning`} 
                        id={med.prescription_id.toString()}
                        name={med.medicine}
                        dosage={med.dosage}
                        time="Morning"
                        isTaken={med.is_taken}
                        onTake={() => handleTake(med.prescription_id, 'Morning')} 
                    />
                ))}
            </View>
        )}

        {/* Afternoon */}
        {getRemindersByTime('Afternoon').length > 0 && (
            <View className="mb-6">
                <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Afternoon</Text>
                {getRemindersByTime('Afternoon').map(med => (
                    <MedicationCard 
                        key={`${med.prescription_id}-afternoon`} 
                        id={med.prescription_id.toString()}
                        name={med.medicine}
                        dosage={med.dosage}
                        time="Afternoon"
                        isTaken={med.is_taken}
                        onTake={() => handleTake(med.prescription_id, 'Afternoon')} 
                    />
                ))}
            </View>
        )}

        {/* Night */}
        {getRemindersByTime('Night').length > 0 && (
            <View className="mb-6">
                <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Night</Text>
                {getRemindersByTime('Night').map(med => (
                    <MedicationCard 
                        key={`${med.prescription_id}-night`} 
                        id={med.prescription_id.toString()}
                        name={med.medicine}
                        dosage={med.dosage}
                        time="Night"
                        isTaken={med.is_taken}
                        onTake={() => handleTake(med.prescription_id, 'Night')} 
                    />
                ))}
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
