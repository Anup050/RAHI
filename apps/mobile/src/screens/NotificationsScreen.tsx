import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCircle2, ChevronLeft, Clock, PhoneIncoming, Star } from 'lucide-react-native';
import { notificationService, NotificationItem } from '../services/notifications';
import { useTranslation } from 'react-i18next';

export default function NotificationsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const formatNotificationTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.max(0, Math.floor(diffMs / 60000));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="p-1 mr-3"
          >
            <ChevronLeft size={28} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">Notifications</Text>
        </View>
        
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text className="text-blue-600 font-semibold text-sm">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#0284c7']} />
        }
      >
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#0284c7" />
          </View>
        ) : notifications.length > 0 ? (
          <View className="px-4 py-4">
            {notifications.map((n) => (

              <TouchableOpacity 
                key={n.id}
                onPress={() => !n.is_read && handleMarkAsRead(n.id)}
                className={`mb-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-row ${!n.is_read ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <View className={`p-2 rounded-full mr-3 ${!n.is_read ? 'bg-blue-50' : 'bg-slate-50'}`}>
                  {n.type === 'appointment' ? (
                    <CheckCircle2 size={20} color={!n.is_read ? '#0284c7' : '#94a3b8'} />
                  ) : n.type === 'call' ? (
                    <PhoneIncoming size={20} color={!n.is_read ? '#0284c7' : '#94a3b8'} />
                  ) : (
                    <Bell size={20} color={!n.is_read ? '#0284c7' : '#94a3b8'} />
                  )}
                </View>
                
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className={`font-bold text-slate-900 ${!n.is_read ? 'text-blue-700' : ''}`}>{n.title}</Text>
                    <Text className="text-slate-400 text-xs">{formatNotificationTime(n.created_at)}</Text>
                  </View>
                  <Text className="text-slate-500 leading-5 text-sm" numberOfLines={2}>
                    {n.message}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center py-20 px-10">
            <View className="bg-slate-100 p-6 rounded-full mb-4">
              <Bell size={40} color="#94a3b8" />
            </View>
            <Text className="text-slate-900 text-xl font-bold mb-2">No notifications</Text>
            <Text className="text-slate-500 text-center">
              We'll notify you about appointments, reminders, and platform updates.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
