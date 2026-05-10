import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, Alert, ActivityIndicator, Modal, TextInput, ScrollView } from 'react-native';
import { AlertTriangle, X, User as UserIcon, Activity } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export const EmergencyCard = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [disease, setDisease] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [doctors, setDoctors] = useState([]);
  const [isFetchingDoctors, setIsFetchingDoctors] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchDoctors();
    }
  }, [showModal]);

  const fetchDoctors = async () => {
    setIsFetchingDoctors(true);
    try {
      const { data } = await api.get('/users/doctors');
      setDoctors(data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setIsFetchingDoctors(false);
    }
  };

  const handleEmergencyTrigger = async () => {
    setIsLoading(true);
    try {
      const payload = {
        doctor_id: selectedDoctor?.id,
        disease: disease.trim() || undefined
      };
      
      const { data } = await api.post('/users/emergency', payload);
      Alert.alert("Emergency Alert Sent", data.message || "Your doctor and Admin have been notified.");
      setShowModal(false);
      setDisease('');
      setSelectedDoctor(null);
    } catch (error) {
      Alert.alert("Error", "Failed to send emergency alert. Please call local emergency services directly.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity 
        className="bg-danger rounded-xl p-4 flex-row items-center justify-center space-x-3 shadow-lg active:opacity-90"
        onPress={() => setShowModal(true)}
        disabled={isLoading}
      >
        <View className="bg-white/20 p-2 rounded-full">
          <AlertTriangle size={24} color="white" />
        </View>
        <Text className="text-white font-bold text-lg uppercase tracking-wider">
          {t('emergency')}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 min-h-[60%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-slate-900">Emergency Alert</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} className="p-2">
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-slate-600 mb-2 font-medium">What is the medical reason? (Optional)</Text>
              <TextInput
                className="bg-slate-50 border border-gray-200 rounded-xl p-4 text-base mb-6 text-slate-700"
                placeholder="e.g. Severe chest pain, breathing difficulty..."
                value={disease}
                onChangeText={setDisease}
              />

              <Text className="text-slate-600 mb-2 font-medium">Direct Alert to Doctor (Optional)</Text>
              {isFetchingDoctors ? (
                <ActivityIndicator color="#0284c7" className="my-4" />
              ) : (
                <View className="flex-row flex-wrap gap-2 mb-8">
                  {doctors.map((doc: any) => (
                    <TouchableOpacity
                      key={doc.id}
                      onPress={() => setSelectedDoctor(selectedDoctor?.id === doc.id ? null : doc)}
                      className={`px-4 py-2 rounded-full border ${selectedDoctor?.id === doc.id ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={`text-sm ${selectedDoctor?.id === doc.id ? 'text-white font-bold' : 'text-slate-600'}`}>
                        Dr. {doc.full_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {doctors.length === 0 && <Text className="text-slate-400 italic">No doctors available</Text>}
                </View>
              )}

              <View className="bg-red-50 p-4 rounded-xl mb-8 border border-red-100 flex-row items-center">
                <AlertTriangle size={20} color="#dc2626" />
                <Text className="text-red-700 text-xs ml-2 flex-1">
                  Triggering this will alert the selected doctor and platform admins immediately. Only use for genuine medical emergencies.
                </Text>
              </View>

              <TouchableOpacity 
                className={`p-4 rounded-xl flex-row justify-center items-center ${isLoading ? 'bg-slate-300' : 'bg-danger'}`}
                onPress={handleEmergencyTrigger}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" className="mr-2" />
                ) : (
                  <AlertTriangle size={20} color="white" className="mr-2" />
                )}
                <Text className="text-white font-bold text-lg">
                  {isLoading ? "SENDING ALERT..." : "CONFIRM EMERGENCY"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};
