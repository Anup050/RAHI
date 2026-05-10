import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ChevronLeft, Search } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES } from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@rahi_language';

const INDIAN_CODES = ['en','hi','mr','te','ta','kn','ml','gu','bn','pa','or','ur'];

export default function LanguagePickerScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(i18n.language || 'en');
  const [search, setSearch] = useState('');

  const handleSelect = async (code: string) => {
    setSelected(code);
    await i18n.changeLanguage(code);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, code);
    } catch {}
    if (navigation?.goBack) navigation.goBack();
  };

  const filtered = SUPPORTED_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.native.toLowerCase().includes(search.toLowerCase())
  );

  const indianLangs = filtered.filter((l) => INDIAN_CODES.includes(l.code));
  const intlLangs = filtered.filter((l) => !INDIAN_CODES.includes(l.code));

  const sections = [
    ...(indianLangs.length > 0 ? [{ title: '🇮🇳 Indian Languages', data: indianLangs }] : []),
    ...(intlLangs.length > 0 ? [{ title: '🌍 International', data: intlLangs }] : []),
  ];

  const renderItem = ({ item }: any) => {
    const isSelected = selected === item.code;
    return (
      <TouchableOpacity
        onPress={() => handleSelect(item.code)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginBottom: 8,
          borderRadius: 16,
          borderWidth: 1,
          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
          borderColor: isSelected ? '#93c5fd' : '#e2e8f0',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 22, marginRight: 12 }}>{item.flag}</Text>
          <View>
            <Text style={{ fontWeight: '700', fontSize: 16, color: isSelected ? '#1d4ed8' : '#1e293b' }}>
              {item.native}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 1 }}>{item.name}</Text>
          </View>
        </View>
        {isSelected && (
          <View style={{ backgroundColor: '#2563eb', borderRadius: 999, padding: 4 }}>
            <Check size={14} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: any) => (
    <View style={{ paddingVertical: 8, paddingTop: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {section.title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
        paddingVertical: 14, backgroundColor: 'white', borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
      }}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={{ marginRight: 12 }}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a' }}>{t('language')}</Text>
          <Text style={{ color: '#64748b', fontSize: 13 }}>Choose your preferred language</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0'
      }}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={{ flex: 1, marginLeft: 10, fontSize: 15, color: '#1e293b' }}
          placeholder="Search language..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Language Sections */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}
