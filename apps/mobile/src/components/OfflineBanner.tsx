import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';

export const OfflineBanner = () => {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setIsOffline(state.isConnected === false);
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View className="bg-slate-800 p-2 flex-row items-center justify-center space-x-2">
      <WifiOff size={16} color="white" />
      <Text className="text-white text-xs font-medium uppercase tracking-wide">
        {t('offline_mode')}
      </Text>
    </View>
  );
};
