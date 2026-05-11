import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { userService } from './user';
import api from './api';

export interface NotificationItem {
    id: number;
    title: string;
    message: string;
    type: 'appointment' | 'system' | 'call';
    is_read: boolean;
    created_at: string;
}

export const notificationService = {
    registerForPushNotificationsAsync: async () => {
        let token;
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Expo Push Token:', token);
            
            // Send token to backend
            try {
                await userService.updateProfile({ push_token: token });
            } catch (error) {
                console.error('Failed to update push token on backend', error);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    },

    init: () => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
    },

    getNotifications: async (): Promise<NotificationItem[]> => {
        try {
            const { data } = await api.get('/notifications');
            return data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    markAsRead: async (id: number): Promise<void> => {
        try {
            await api.post(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    markAllAsRead: async (): Promise<void> => {
        try {
            await api.post('/notifications/read-all');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
};

