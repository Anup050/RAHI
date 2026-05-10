import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, Pill, ChevronLeft } from 'lucide-react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type HistoryItem = {
  type: 'medication' | 'emergency' | 'note';
  title: string;
  subtitle: string;
  date: string;
};

export default function MedicalHistoryScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const combined: HistoryItem[] = [];

      // Fetch medication adherence history
      const { data: medData } = await api.get('/prescriptions/history/me');
      for (const item of (medData || [])) {
        combined.push({
          type: 'medication',
          title: item.medicine || t('medication') || 'Medication',
          subtitle: `${item.dosage || ''} — ${item.time_of_day || ''}`,
          date: item.taken_at,
        });
      }

      // Fetch clinical notes (emergencies are stored here)
      const { data: notesData } = await api.get(`/notes/${user?.id}`);
      for (const note of (notesData || [])) {
        const isEmergency = (note.tags || []).includes('EMERGENCY');
        combined.push({
          type: isEmergency ? 'emergency' : 'note',
          title: isEmergency ? `🚨 ${t('emergency_alert') || 'Emergency Alert'}` : (t('clinical_note') || 'Clinical Note'),
          subtitle: note.content,
          date: note.created_at,
        });
      }

      // Sort by date descending
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(combined);
    } catch (error) {
      console.error('Failed to fetch medical history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'emergency') return <AlertTriangle size={18} color="#ef4444" />;
    if (type === 'medication') return <Pill size={18} color="#0284c7" />;
    return <Activity size={18} color="#8b5cf6" />;
  };

  const getBgColor = (type: string) => {
    if (type === 'emergency') return 'bg-red-50 border-red-200';
    if (type === 'medication') return 'bg-blue-50 border-blue-200';
    return 'bg-purple-50 border-purple-200';
  };

  const getIconBg = (type: string) => {
    if (type === 'emergency') return 'bg-red-100';
    if (type === 'medication') return 'bg-blue-100';
    return 'bg-purple-100';
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr.includes('Z') ? dateStr : dateStr + 'Z');
      return d.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation?.goBack?.()} className="mr-3">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-slate-900">{t('medical_history')}</Text>
          <Text className="text-slate-500 text-sm">{t('health_timeline_subtitle') || "Your complete health timeline"}</Text>
        </View>
      </View>

      <ScrollView className="px-4 py-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0284c7" />
            <Text className="text-slate-500 mt-3">{t('loading_history') || "Loading your history..."}</Text>
          </View>
        ) : history.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Activity size={48} color="#cbd5e1" />
            <Text className="text-slate-500 mt-4 text-center text-lg">{t('no_history')}</Text>
            <Text className="text-slate-400 text-center text-sm mt-1">
              {t('no_history_subtitle') || "Your medication logs and health events will appear here."}
            </Text>
          </View>
        ) : (
          <View className="space-y-3 pb-8">
            {history.map((item, index) => (
              <View
                key={index}
                className={`flex-row items-start p-4 rounded-2xl border ${getBgColor(item.type)}`}
              >
                <View className={`p-2 rounded-full mr-3 mt-0.5 ${getIconBg(item.type)}`}>
                  {getIcon(item.type)}
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-900 text-base">{item.title}</Text>
                  {item.subtitle ? (
                    <Text className="text-slate-600 text-sm mt-0.5" numberOfLines={2}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                  <Text className="text-slate-400 text-xs mt-2">{formatDate(item.date)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
