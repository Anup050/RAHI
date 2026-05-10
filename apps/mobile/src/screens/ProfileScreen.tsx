import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, ChevronRight, FileText, LogOut, Edit2, Check, X, RefreshCcw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user';
import * as Updates from 'expo-updates';

export default function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { logout, user, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.full_name || '');
  const [newPhone, setNewPhone] = useState(user?.phone_number || '');
  const [newAge, setNewAge] = useState(user?.age ? user.age.toString() : '');
  const [newGender, setNewGender] = useState(user?.gender || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const handleCheckUpdate = async () => {
    if (__DEV__) {
        Alert.alert("Development Mode", "Update checking is simulated in development. In production, this will check for OTA updates.");
        return;
    }

    setIsCheckingUpdate(true);
    try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
            Alert.alert(
                t('update_available'),
                t('update_available_msg'),
                [
                    { text: t('cancel'), style: 'cancel' },
                    { 
                        text: t('download_and_install'), 
                        onPress: async () => {
                            try {
                                await Updates.fetchUpdateAsync();
                                await Updates.reloadAsync();
                            } catch (e) {
                                Alert.alert(t('update_error'), t('update_error_msg'));
                            }
                        }
                    }
                ]
            );
        } else {
            Alert.alert(t('app_up_to_date'), t('app_up_to_date_msg'));
        }
    } catch (error) {
        console.error("Update check failed:", error);
        Alert.alert(t('update_error'), t('update_error_msg'));
    } finally {
        setIsCheckingUpdate(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
        Alert.alert(t('error') || "Error", t('name_cannot_be_empty') || "Name cannot be empty");
        return;
    }
    
    setIsUpdating(true);
    try {
        const updatedUser = await userService.updateProfile({ 
            full_name: newName,
            phone_number: newPhone,
            age: newAge ? parseInt(newAge) : undefined,
            gender: newGender ? newGender : undefined
        });
        await updateUser(updatedUser);
        setIsEditing(false);
        Alert.alert(t('success') || "Success", t('profile_updated') || "Profile updated successfully");
    } catch (error: any) {
        Alert.alert(t('error') || "Error", error.response?.data?.detail || "Failed to update profile");
    } finally {
        setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView>
        {/* Header Profile */}
        <View className="bg-white p-6 items-center border-b border-gray-200">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
                <User size={40} color="#0284c7" />
            </View>
            
            {isEditing ? (
                <View className="w-full px-4">
                    <TextInput
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2 text-lg text-slate-900 mb-4"
                        value={newName}
                        onChangeText={setNewName}
                        placeholder={t('enter_full_name') || "Enter full name"}
                        autoFocus
                    />
                    <TextInput
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2 text-lg text-slate-900 mb-4"
                        value={newPhone}
                        onChangeText={setNewPhone}
                        placeholder={t('enter_phone_number') || "Enter phone number"}
                        keyboardType="phone-pad"
                    />
                    <View className="flex-row gap-2 mb-6">
                        <TextInput
                            className="flex-1 bg-slate-50 border border-gray-200 rounded-lg px-4 py-2 text-lg text-slate-900"
                            value={newAge}
                            onChangeText={setNewAge}
                            placeholder="Age"
                            keyboardType="number-pad"
                        />
                        <TextInput
                            className="flex-1 bg-slate-50 border border-gray-200 rounded-lg px-4 py-2 text-lg text-slate-900"
                            value={newGender}
                            onChangeText={setNewGender}
                            placeholder="Gender"
                        />
                    </View>
                    <View className="flex-row items-center justify-center">
                        <TouchableOpacity 
                            onPress={handleUpdateName}
                            disabled={isUpdating}
                            className="bg-green-500 px-6 py-2 rounded-lg flex-row items-center mr-4"
                        >
                            {isUpdating ? <ActivityIndicator color="white" size="small" /> : <Check size={20} color="white" />}
                            <Text className="text-white ml-2 font-bold">{t('save') || "Save"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => {
                                setIsEditing(false);
                                setNewName(user?.full_name || '');
                                setNewPhone(user?.phone_number || '');
                                setNewAge(user?.age ? user.age.toString() : '');
                                setNewGender(user?.gender || '');
                            }}
                            disabled={isUpdating}
                            className="bg-slate-200 px-6 py-2 rounded-lg flex-row items-center"
                        >
                            <X size={20} color="#64748b" />
                            <Text className="text-slate-600 ml-2 font-bold">{t('cancel') || "Cancel"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <View className="flex-row items-center">
                        <Text className="text-xl font-bold text-slate-900 mr-2">{user?.full_name || t('guest_user') || "Guest User"}</Text>
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Edit2 size={16} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                    {user?.rahi_id && (
                        <View className="bg-blue-50 mt-2 px-3 py-1 rounded-full border border-blue-100">
                            <Text className="text-blue-700 font-bold text-xs">{user.rahi_id}</Text>
                        </View>
                    )}
                    <Text className="text-slate-500 mt-2">{user?.phone_number || user?.email || t('no_contact_info') || "No contact info"}</Text>
                    {(user?.age || user?.gender) && (
                        <Text className="text-slate-500 mt-1">
                            {user?.age ? `${user.age} yrs` : ''} {user?.gender ? `• ${user.gender}` : ''}
                        </Text>
                    )}
                </>
            )}
            <View className="mt-2 bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 font-bold text-xs uppercase">RAHI Verified</Text>
            </View>
        </View>

        {/* Settings List */}
        <View className="mt-6 px-4">
            <Text className="text-slate-500 font-medium mb-2 uppercase text-xs tracking-wider">{t('settings') || "Settings"}</Text>
            
                <TouchableOpacity 
                    className="flex-row items-center justify-between p-4 border-b border-gray-100"
                    onPress={() => navigation?.navigate?.('MedicalHistory')}
                >
                    <View className="flex-row items-center">
                        <View className="bg-blue-100 p-2 rounded-lg mr-3">
                             <FileText size={20} color="#0284c7" />
                        </View>
                        <Text className="text-slate-700 font-medium text-lg">{t('medical_history')}</Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity 
                    className="flex-row items-center justify-between p-4 border-t border-gray-100"
                    onPress={handleCheckUpdate}
                    disabled={isCheckingUpdate}
                >
                    <View className="flex-row items-center">
                        <View className="bg-green-100 p-2 rounded-lg mr-3">
                             {isCheckingUpdate ? <ActivityIndicator size={20} color="#16a34a" /> : <RefreshCcw size={20} color="#16a34a" />}
                        </View>
                        <Text className="text-slate-700 font-medium text-lg">{t('check_for_updates')}</Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" />
                </TouchableOpacity>
            </View>

        <View className="mt-6 px-4 mb-10">
            <TouchableOpacity 
                onPress={logout}
                className="bg-white rounded-xl p-4 flex-row items-center justify-center border border-red-100 shadow-sm"
            >
                <LogOut size={20} color="#ef4444" style={{ marginRight: 8 }} />
                <Text className="text-red-500 font-medium text-lg">{t('logout') || "Log Out"}</Text>
            </TouchableOpacity>
        </View>

        <View className="items-center mb-8">
            <Text className="text-slate-400 text-xs">Version 1.0.0 (Beta)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
