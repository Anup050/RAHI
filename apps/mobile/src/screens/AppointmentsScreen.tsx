import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Calendar, Video, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

interface Appointment {
    id: number;
    doctor_id: number;
    patient_name: string;
    time: string;
    status: string; // "Pending", "Confirmed", "In Progress", "Completed", "Declined"
    type: string;
    reason: string;
}

export default function AppointmentsScreen() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
        const response = await api.get<Appointment[]>('/appointments/');
        setAppointments(response.data);
    } catch (error) {
        console.error("Failed to fetch appointments", error);
        // Fallback for demo if backend is offline or empty
        // setAppointments([]); 
    } finally {
        setLoading(false);
    }
  };

  // Polling for updates (Simulating Push Notifications)
  React.useEffect(() => {
    const interval = setInterval(async () => {
        try {
            const response = await api.get<Appointment[]>('/appointments/');
            const newAppointments = response.data;
            
            // Check for status changes (Notification Logic)
            newAppointments.forEach(newApt => {
                const oldApt = appointments.find(a => a.id === newApt.id);
                if (oldApt) {
                    // 1. Confirmation Notification
                    if (oldApt.status === 'Pending' && newApt.status === 'Confirmed') {
                        Alert.alert(
                            "Appointment Confirmed", 
                            `Your appointment with Dr. Sharma at ${newApt.time} has been confirmed!`
                        );
                    }
                    
                    // 2. Incoming Call Notification
                    if (oldApt.status !== 'In Progress' && newApt.status === 'In Progress') {
                         Alert.alert(
                            "Incoming Video Call", 
                            "Dr. Sharma has started the consultation.",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Join Now", onPress: () => handleJoinCall(newApt.id) }
                            ]
                        );
                    }
                }
            });
            
            setAppointments(newAppointments);
        } catch (error) {
            // silent fail on poll
        }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [appointments]); // Depend on appointments to compare old vs new

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const handleJoinCall = (id: number) => {
    const url = `https://meet.jit.si/RAHI-${id}`;
    Linking.openURL(url).catch(err => {
        console.error('Failed to open URL:', err);
        Alert.alert("Error", "Could not open video call link.");
    });
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Confirmed': return 'text-green-600 bg-green-50';
          case 'In Progress': return 'text-blue-600 bg-blue-50';
          case 'Pending': return 'text-yellow-600 bg-yellow-50';
          case 'Declined': return 'text-red-600 bg-red-50';
          default: return 'text-slate-500 bg-slate-100';
      }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-slate-900">{t('my_appointments') || "My Appointments"}</Text>
      </View>

      <ScrollView 
        className="px-4 py-6"
        refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchAppointments} />
        }
      >
        {appointments.length === 0 && !loading ? (
            <View className="items-center justify-center p-8">
                <Calendar size={48} color="#cbd5e1" />
                <Text className="text-slate-500 mt-4 text-center">No upcoming appointments.</Text>
            </View>
        ) : (
            appointments.map((apt) => (
                <View key={apt.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
                    <View className="flex-row justify-between items-start mb-2">
                        <View>
                            <Text className="text-lg font-bold text-slate-900">Dr. Sharma</Text>
                            <Text className="text-slate-500 text-sm">{apt.type}</Text>
                        </View>
                        <View className={`px-2 py-1 rounded-md ${getStatusColor(apt.status).split(' ')[1]}`}>
                            <Text className={`text-xs font-bold uppercase ${getStatusColor(apt.status).split(' ')[0]}`}>{apt.status}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-4">
                        <Clock size={16} color="#64748b" className="mr-2" />
                        <Text className="text-slate-600">{apt.time}</Text>
                    </View>

                    {apt.reason && (
                        <View className="bg-slate-50 p-3 rounded-lg mb-4">
                            <Text className="text-slate-500 text-sm italic">"{apt.reason}"</Text>
                        </View>
                    )}

                    {(apt.status === 'Confirmed' || apt.status === 'In Progress') && (
                        <TouchableOpacity 
                            onPress={() => handleJoinCall(apt.id)}
                            className="bg-primary p-3 rounded-lg flex-row justify-center items-center bg-blue-600"
                        >
                            <Video size={20} color="white" className="mr-2" />
                            <Text className="text-white font-bold">{t('join_call') || "Join Video Call"}</Text>
                        </TouchableOpacity>
                    )}
                    
                    {apt.status === 'Pending' && (
                        <View className="flex-row items-center justify-center p-2 bg-yellow-50 rounded-lg">
                            <AlertCircle size={16} color="#ca8a04" style={{ marginRight: 8 }} />
                            <Text className="text-yellow-700 text-sm">Waiting for doctor confirmation</Text>
                        </View>
                    )}
                </View>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
