import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export const EmergencyCard = () => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity 
      className="bg-danger rounded-xl p-4 flex-row items-center justify-center space-x-3 shadow-lg active:opacity-90"
      onPress={() => console.log('Emergency Call')}
    >
      <View className="bg-white/20 p-2 rounded-full">
        <AlertTriangle size={24} color="white" />
      </View>
      <Text className="text-white font-bold text-lg uppercase tracking-wider">
        {t('emergency')}
      </Text>
    </TouchableOpacity>
  );
};
