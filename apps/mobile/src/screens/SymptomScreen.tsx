import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MessageSquare, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react-native';
import api from '../services/api';

// types
interface Prediction {
    disease: string;
    confidence: number;
}

interface ApiResponse {
    predictions: Prediction[];
    message?: string;
}

export default function SymptomScreen() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Result
  const [result, setResult] = useState<Prediction | null>(null);

  const handleDiagnose = async () => {
    if (!symptoms.trim()) return;
    setStep(2);
    
    try {
        const response = await api.post<ApiResponse>('/symptoms/predict', {
            symptoms: symptoms
        });

        if (response.data.predictions && response.data.predictions.length > 0) {
            setResult(response.data.predictions[0]);
            setStep(3);
        } else {
            Alert.alert("No Diagnosis", "Could not identify a condition based on these symptoms.");
            setStep(1);
        }
    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to connect to AI Doctor. Please try again.");
        setStep(1);
    }
  };

  const reset = () => {
    setSymptoms('');
    setResult(null);
    setStep(1);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4">
      {/* Step 1: Input */}
      {step === 1 && (
        <View className="flex-1 justify-center">
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <View className="bg-blue-100 w-16 h-16 rounded-full items-center justify-center mb-6 self-center">
                    <MessageSquare size={32} color="#0284c7" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 text-center mb-2">{t('symptoms')}</Text>
                <Text className="text-slate-500 text-center mb-6">Describe how you are feeling (e.g., headache, fever).</Text>
                
                <TextInput
                    className="bg-slate-50 border border-gray-200 rounded-xl p-4 text-base min-h-[120px] mb-6 text-slate-700"
                    placeholder="Enter symptoms here..."
                    multiline
                    textAlignVertical="top"
                    value={symptoms}
                    onChangeText={setSymptoms}
                />

                <TouchableOpacity 
                    className={`p-4 rounded-xl flex-row justify-center items-center ${symptoms ? 'bg-primary' : 'bg-slate-300'}`}
                    onPress={handleDiagnose}
                    disabled={!symptoms}
                >
                    <Text className="text-white font-bold text-lg mr-2">{t('diagnose_now')}</Text>
                    <ArrowRight size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
      )}

      {/* Step 2: Loading */}
      {step === 2 && (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0284c7" />
            <Text className="text-slate-500 mt-4 text-lg font-medium animate-pulse">{t('consulting_doctor')}</Text>
        </View>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <View className="flex-1 justify-center">
            <View className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-100">
                <View className="bg-red-100 w-16 h-16 rounded-full items-center justify-center mb-6 self-center">
                    <AlertTriangle size={32} color="#dc2626" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 text-center mb-2">{result.disease}</Text>
                
                <View className="self-center bg-red-100 px-4 py-1 rounded-full mb-6">
                    <Text className="text-red-700 font-bold uppercase text-sm tracking-wide">
                        {result.confidence > 0.7 ? t('risk_high') : t('risk_low')} ({(result.confidence * 100).toFixed(0)}%)
                    </Text>
                </View>

                <Text className="text-slate-600 text-center mb-8 leading-6 bg-slate-50 p-4 rounded-lg">
                    Based on your symptoms, there is a probability of {result.disease}. Please consult a doctor for confirmation.
                </Text>

                <TouchableOpacity 
                    className="bg-danger p-4 rounded-xl flex-row justify-center items-center mb-4"
                    onPress={async () => {
                        try {
                            await api.post('/appointments/', {
                                patient_name: "Ramesh Kumar", // Hardcoded for demo matching HomeScreen
                                time: new Date().toLocaleString(),
                                type: "Video Consult",
                                reason: result.disease
                            });
                            Alert.alert("Success", "Doctor appointment booked successfully! You will be notified when the doctor confirms.");
                        } catch (error: any) {
                            console.error(error);
                            if (error.response?.status === 401 || error.response?.status === 403) {
                                Alert.alert("Session Expired", "Please logout from Profile and login again to book an appointment.");
                            } else {
                                Alert.alert("Error", "Failed to book appointment. Please try again.");
                            }
                        }
                    }}
                >
                    <Text className="text-white font-bold text-lg">{t('book_doctor')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={reset} className="p-4 rounded-xl flex-row justify-center items-center">
                    <Text className="text-slate-500 font-bold">Check Another Symptom</Text>
                </TouchableOpacity>
            </View>
        </View>
      )}
    </SafeAreaView>
  );
}
