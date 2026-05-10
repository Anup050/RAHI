import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Calendar, Video, Clock, CheckCircle, AlertCircle, Star, X } from 'lucide-react-native';
import { Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import VideoCallModal from '../components/VideoCallModal';
import IncomingCallOverlay from '../components/IncomingCallOverlay';

interface Appointment {
    id: number;
    doctor_id: number;
    doctor_name?: string;
    patient_name: string;
    time: string;
    status: string; // "Pending", "Confirmed", "In Progress", "Completed", "Declined"
    type: string;
    reason: string;
    has_review?: boolean;
    rating?: number;
}

export default function AppointmentsScreen() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [videoCallVisible, setVideoCallVisible] = useState(false);
  const [activeAppointmentId, setActiveAppointmentId] = useState<number | null>(null);
  
  // Ringing State
  const [isRinging, setIsRinging] = useState(false);
  const [incomingCallerName, setIncomingCallerName] = useState('');

  // Review Modal State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
        const response = await api.get<Appointment[]>('/appointments/');
        setAppointments(response.data);
    } catch (error) {
        console.error("Failed to fetch appointments", error);
        // Fallback for demo if backend is offline or empty
        // setAppointments([]); 
    } finally {
        setLoading(false);
    }
  };

  // Polling for updates (Simulating Push Notifications)
  React.useEffect(() => {
    const interval = setInterval(async () => {
        try {
            const response = await api.get<Appointment[]>('/appointments/');
            const newAppointments = response.data;
            
            // Check for status changes (Notification Logic)
            newAppointments.forEach(newApt => {
                const oldApt = appointments.find(a => a.id === newApt.id);
                if (oldApt) {
                    // 1. Confirmation Notification
                    if (oldApt.status === 'Pending' && newApt.status === 'Confirmed') {
                        Alert.alert(
                            "Appointment Confirmed", 
                            `Your appointment with ${oldApt.doctor_name || 'your doctor'} at ${newApt.time} has been confirmed!`
                        );
                    }
                    
                    // 2. Incoming Call Notification
                    if (oldApt.status !== 'In Progress' && newApt.status === 'In Progress') {
                        setIncomingCallerName(oldApt.doctor_name || 'Your doctor');
                        setActiveAppointmentId(newApt.id);
                        setIsRinging(true);
                    }
                }
            });
            
            setAppointments(newAppointments);
        } catch (error) {
            // silent fail on poll
        }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [appointments]); // Depend on appointments to compare old vs new

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const handleJoinCall = (id: number) => {
    setActiveAppointmentId(id);
    setVideoCallVisible(true);
  };

  const handleOpenReview = (id: number) => {
    setActiveAppointmentId(id);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const submitReview = async () => {
    if (!activeAppointmentId) return;
    setSubmittingReview(true);
    try {
        await api.post(`/appointments/${activeAppointmentId}/review`, {
            rating: reviewRating,
            comment: reviewComment
        });
        Alert.alert("Success", "Thank you for your feedback!");
        setReviewModalVisible(false);
        fetchAppointments(); // Refresh to hide review button
    } catch (error) {
        console.error("Failed to submit review", error);
        Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
        setSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Confirmed': return 'text-green-600 bg-green-50';
          case 'In Progress': return 'text-blue-600 bg-blue-50';
          case 'Pending': return 'text-yellow-600 bg-yellow-50';
          case 'Declined': return 'text-red-600 bg-red-50';
          default: return 'text-slate-500 bg-slate-100';
      }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-slate-900">{t('my_appointments') || "My Appointments"}</Text>
      </View>

      <ScrollView 
        className="px-4 py-6"
        refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchAppointments} />
        }
      >
        {appointments.length === 0 && !loading ? (
            <View className="items-center justify-center p-8">
                <Calendar size={48} color="#cbd5e1" />
                <Text className="text-slate-500 mt-4 text-center">No upcoming appointments.</Text>
            </View>
        ) : (
            appointments.map((apt) => (
                <View key={apt.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
                    <View className="flex-row justify-between items-start mb-2">
                        <View>
                            <Text className="text-lg font-bold text-slate-900">{apt.doctor_name || 'Unassigned'}</Text>
                            <Text className="text-slate-500 text-sm">{apt.type}</Text>
                        </View>
                        <View className={`px-2 py-1 rounded-md ${getStatusColor(apt.status).split(' ')[1]}`}>
                            <Text className={`text-xs font-bold uppercase ${getStatusColor(apt.status).split(' ')[0]}`}>{apt.status}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-4">
                        <Clock size={16} color="#64748b" style={{ marginRight: 8 }} />
                        <Text className="text-slate-600">{apt.time}</Text>
                    </View>

                    {apt.reason && (
                        <View className="bg-slate-50 p-3 rounded-lg mb-4">
                            <Text className="text-slate-500 text-sm italic">"{apt.reason}"</Text>
                        </View>
                    )}

                    {(apt.status === 'Confirmed' || apt.status === 'In Progress') && (
                        <TouchableOpacity 
                            onPress={() => handleJoinCall(apt.id)}
                            className="bg-primary p-3 rounded-lg flex-row justify-center items-center bg-blue-600"
                        >
                            <Video size={20} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white font-bold">{t('join_call') || "Join Video Call"}</Text>
                        </TouchableOpacity>
                    )}
                    
                    {apt.status === 'Pending' && (
                        <View className="flex-row items-center justify-center p-2 bg-yellow-50 rounded-lg">
                            <AlertCircle size={16} color="#ca8a04" style={{ marginRight: 8 }} />
                            <Text className="text-yellow-700 text-sm">Waiting for doctor confirmation</Text>
                        </View>
                    )}

                    {apt.status === 'Completed' && !apt.has_review && (
                        <TouchableOpacity 
                            onPress={() => handleOpenReview(apt.id)}
                            className="bg-green-600 p-3 rounded-lg flex-row justify-center items-center mt-2"
                        >
                            <Star size={20} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white font-bold">Rate Consultation</Text>
                        </TouchableOpacity>
                    )}

                    {apt.status === 'Completed' && apt.has_review && (
                        <View className="flex-row items-center justify-center p-2 bg-slate-50 rounded-lg mt-2">
                            <Star size={16} color="#f59e0b" fill="#f59e0b" style={{ marginRight: 8 }} />
                            <Text className="text-slate-600 text-sm">Rated: {apt.rating}/5</Text>
                        </View>
                    )}
                </View>
            ))
        )}
      </ScrollView>

      <VideoCallModal 
        visible={videoCallVisible} 
        appointmentId={activeAppointmentId} 
        onClose={() => setVideoCallVisible(false)} 
      />

      <IncomingCallOverlay
        visible={isRinging}
        callerName={incomingCallerName}
        onAccept={() => {
            setIsRinging(false);
            if (activeAppointmentId) handleJoinCall(activeAppointmentId);
        }}
        onDecline={() => setIsRinging(false)}
      />

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">Rate Consultation</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-600 mb-4 text-center">How was your experience?</Text>
            
            <View className="flex-row justify-center mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setReviewRating(s)} className="mx-2">
                  <Star 
                    size={40} 
                    color={s <= reviewRating ? "#f59e0b" : "#cbd5e1"} 
                    fill={s <= reviewRating ? "#f59e0b" : "transparent"} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 mb-6"
              placeholder="Write a comment (optional)..."
              multiline
              numberOfLines={4}
              value={reviewComment}
              onChangeText={setReviewComment}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              onPress={submitReview}
              disabled={submittingReview}
              className={`p-4 rounded-xl items-center ${submittingReview ? 'bg-slate-300' : 'bg-blue-600'}`}
            >
              <Text className="text-white font-bold text-lg">
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
