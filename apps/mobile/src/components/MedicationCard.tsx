import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, CheckCircle, Pill } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface MedicationCardProps {
  name: string;
  time: string;
  dosage: string;
  isTaken?: boolean;
  onTake: () => void;
}

export const MedicationCard = ({ name, time, dosage, isTaken, onTake }: MedicationCardProps) => {
  const { t } = useTranslation();

  return (
    <View className={`p-4 rounded-xl border-2 mb-4 ${isTaken ? 'bg-green-50 border-success' : 'bg-white border-gray-200'}`}>
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center space-x-2">
            <View className={`p-2 rounded-full ${isTaken ? 'bg-green-100' : 'bg-blue-100'}`}>
                <Pill size={20} color={isTaken ? '#16a34a' : '#0284c7'} />
            </View>
            <View>
                <Text className="text-lg font-bold text-slate-800">{name}</Text>
                <Text className="text-sm text-slate-500">{dosage}</Text>
            </View>
        </View>
        <View className="flex-row items-center bg-slate-100 px-3 py-1 rounded-full">
            <Clock size={14} color="#64748b" />
            <Text className="text-slate-600 font-medium ml-1">{time}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        className={`flex-row items-center justify-center py-3 rounded-lg ${isTaken ? 'bg-transparent' : 'bg-primary'}`}
        onPress={onTake}
        disabled={isTaken}
      >
        {isTaken ? (
            <View className="flex-row items-center">
                 <CheckCircle size={20} color="#16a34a" />
                 <Text className="ml-2 font-bold text-success text-base">{t('mark_taken')}</Text>
            </View>
        ) : (
            <Text className="text-white font-bold text-base">{t('mark_taken')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
