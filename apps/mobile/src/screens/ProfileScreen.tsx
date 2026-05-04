import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Globe, ChevronRight, FileText, LogOut, Edit2, Check, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { logout, user, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateName = async () => {
    if (!newName.trim()) {
        Alert.alert("Error", "Name cannot be empty");
        return;
    }
    
    setIsUpdating(true);
    try {
        const updatedUser = await userService.updateProfile({ full_name: newName });
        await updateUser(updatedUser);
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
        Alert.alert("Error", error.response?.data?.detail || "Failed to update profile");
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
                <View className="w-full flex-row items-center justify-center space-x-2 px-4">
                    <TextInput
                        className="flex-1 bg-slate-50 border border-gray-200 rounded-lg px-4 py-2 text-lg text-slate-900"
                        value={newName}
                        onChangeText={setNewName}
                        placeholder="Enter full name"
                        autoFocus
                    />
                    <TouchableOpacity 
                        onPress={handleUpdateName}
                        disabled={isUpdating}
                        className="bg-green-500 p-2 rounded-lg"
                    >
                        {isUpdating ? <ActivityIndicator color="white" size="small" /> : <Check size={20} color="white" />}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => {
                            setIsEditing(false);
                            setNewName(user?.full_name || '');
                        }}
                        disabled={isUpdating}
                        className="bg-slate-200 p-2 rounded-lg"
                    >
                        <X size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="flex-row items-center space-x-2">
                    <Text className="text-xl font-bold text-slate-900">{user?.full_name || "Guest User"}</Text>
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <Edit2 size={16} color="#64748b" />
                    </TouchableOpacity>
                </View>
            )}

            <Text className="text-slate-500 mt-1">{user?.phone_number || user?.email || "No contact info"}</Text>
            <View className="mt-2 bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 font-bold text-xs uppercase">RAHI Verified</Text>
            </View>
        </View>

        {/* Settings List */}
        <View className="mt-6 px-4">
            <Text className="text-slate-500 font-medium mb-2 uppercase text-xs tracking-wider">Settings</Text>
            
            <View className="bg-white rounded-xl overflow-hidden shadow-sm">
                <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
                    <View className="flex-row items-center space-x-3">
                        <View className="bg-orange-100 p-2 rounded-lg">
                             <Globe size={20} color="#ea580c" />
                        </View>
                        <Text className="text-slate-700 font-medium text-lg">{t('language')}</Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center space-x-3">
                        <View className="bg-blue-100 p-2 rounded-lg">
                             <FileText size={20} color="#0284c7" />
                        </View>
                        <Text className="text-slate-700 font-medium text-lg">Medical History</Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" />
                </TouchableOpacity>
            </View>
        </View>

        <View className="mt-6 px-4 mb-10">
            <TouchableOpacity 
                onPress={logout}
                className="bg-white rounded-xl p-4 flex-row items-center justify-center space-x-2 border border-red-100 shadow-sm"
            >
                <LogOut size={20} color="#ef4444" />
                <Text className="text-red-500 font-medium text-lg">Log Out</Text>
            </TouchableOpacity>
        </View>

        <View className="items-center mb-8">
            <Text className="text-slate-400 text-xs">Version 1.0.0 (Beta)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
