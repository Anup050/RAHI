import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Globe, ChevronRight, FileText, LogOut } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView>
        {/* Header Profile */}
        <View className="bg-white p-6 items-center border-b border-gray-200">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
                <User size={40} color="#0284c7" />
            </View>
            <Text className="text-xl font-bold text-slate-900">{user?.full_name || "Guest User"}</Text>
            <Text className="text-slate-500">{user?.phone_number || user?.email || "No contact info"}</Text>
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
