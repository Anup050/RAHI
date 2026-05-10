import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, ScrollView as RNScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, Briefcase, Building2, Video, MapPin, Clock, Calendar as CalendarIcon, X, Info, User as UserIcon } from 'lucide-react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DoctorSelectionScreen({ navigation, route }: any) {
    const { category, disease } = route.params || {};
    const { user } = useAuth();
    const [specialists, setSpecialists] = useState([]);
    const [generalists, setGeneralists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Booking Modal State
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [selectedType, setSelectedType] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState("");
    const [isBooking, setIsBooking] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // Profile Modal State
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [doctorReviews, setDoctorReviews] = useState<any[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                // Fetch all approved doctors
                const response = await api.get('/users/doctors');
                const allDoctors = response.data;
                
                // Filter specialists and generalists (case-insensitive)
                const catLower = category?.toLowerCase();
                const specList = allDoctors.filter((d: any) => 
                    d.specialization?.toLowerCase() === catLower
                );
                
                // General list excludes those already in specList
                const genList = allDoctors.filter((d: any) => {
                    const isGen = d.specialization?.toLowerCase() === "general physician" || !d.specialization;
                    const inSpec = specList.some((s: any) => s.id === d.id);
                    return isGen && !inSpec;
                });
                
                setSpecialists(specList);
                setGeneralists(genList);
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Failed to fetch doctors list.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDoctors();
    }, [category]);

    const openBooking = (doctor: any, consultType: string) => {
        setSelectedDoctor(doctor);
        setSelectedType(consultType);
        setSelectedDate(new Date());
        setSelectedSlot("");
        setBookingModalVisible(true);
    };

    const openProfile = async (doctor: any) => {
        setSelectedProfile(doctor);
        setProfileModalVisible(true);
        setIsLoadingReviews(true);
        try {
            const res = await api.get(`/users/${doctor.id}/reviews`);
            setDoctorReviews(res.data);
        } catch(e) {
            console.error("Failed to fetch reviews:", e);
            setDoctorReviews([]);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (bookingModalVisible && selectedDoctor) {
            fetchAvailableSlots();
        }
    }, [selectedDate, selectedDoctor, bookingModalVisible]);

    const fetchAvailableSlots = async () => {
        setIsLoadingSlots(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await api.get(`/appointments/availability/${selectedDoctor.id}?date=${dateStr}`);
            setAvailableSlots(response.data);
        } catch (error) {
            console.error("Failed to fetch slots:", error);
            setAvailableSlots([]);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const handleBook = async () => {
        if (!selectedSlot) {
            Alert.alert("Error", "Please select a time slot.");
            return;
        }

        setIsBooking(true);
        try {
            // Format time: YYYY-MM-DDTHH:MM:SSZ
            const dateStr = selectedDate.toISOString().split('T')[0];
            const [time, period] = selectedSlot.split(' ');
            let [hours, minutes] = time.split(':');
            if (period === 'PM' && hours !== '12') hours = (parseInt(hours) + 12).toString();
            if (period === 'AM' && hours === '12') hours = '00';
            const formattedTime = `${dateStr}T${hours.padStart(2, '0')}:${minutes}:00Z`;

            console.log(`DEBUG: handleBook - Selected Doctor: ${selectedDoctor?.full_name} (ID: ${selectedDoctor?.id})`);
            console.log(`DEBUG: handleBook - Payload doctor_id: ${selectedDoctor?.id}`);
            
            await api.post('/appointments/', {
                patient_name: user?.full_name || user?.email || "Patient",
                doctor_id: selectedDoctor.id,
                time: formattedTime,
                type: selectedType,
                reason: disease || "Routine Checkup"
            });
            
            const doctorName = selectedDoctor?.full_name || "Doctor";
            setBookingModalVisible(false);
            Alert.alert("Success", `Appointment booked with ${doctorName}! Wait for confirmation.`, [
                { text: "OK", onPress: () => navigation.navigate("Main") }
            ]);
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 409) {
                const detail = error.response.data.detail;
                const message = detail.message || "This slot is already booked.";
                const suggestion = detail.suggested_slot ? `\n\nSuggestion: ${new Date(detail.suggested_slot).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : "";
                
                Alert.alert(
                    "Slot Unavailable", 
                    `${message}${suggestion}`,
                    [{ text: "OK" }]
                );
            } else {
                Alert.alert("Error", "Failed to book appointment. Please try again.");
            }
        } finally {
            setIsBooking(false);
        }
    };

    const renderDoctor = (item: any) => (
        <View key={item.id} className="bg-white p-4 rounded-2xl mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4">
                <View className="bg-blue-100 w-16 h-16 rounded-2xl items-center justify-center mr-4">
                    <Text className="text-xl font-bold text-blue-700">
                        {item.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </Text>
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-900">{item.full_name}</Text>
                    <Text className="text-primary font-medium">{item.specialization || "General Physician"}</Text>
                    <View className="flex-row items-center mt-1">
                        <Star size={14} color="#f59e0b" fill="#f59e0b" />
                        <Text className="text-xs text-slate-500 ml-1">
                            {item.avg_rating || "0.0"} ({item.review_count || 0} reviews)
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => openProfile(item)} className="p-2 bg-slate-50 rounded-full border border-slate-100">
                    <Info size={20} color="#0284c7" />
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between mb-4 bg-slate-50 p-3 rounded-xl">
                <View className="items-center flex-1 border-r border-gray-200">
                    <Briefcase size={16} color="#64748b" />
                    <Text className="text-xs text-slate-500 mt-1">Experience</Text>
                    <Text className="text-sm font-bold text-slate-700">{item.experience_years || 0}+ yrs</Text>
                </View>
                <View className="items-center flex-1">
                    <Building2 size={16} color="#64748b" />
                    <Text className="text-xs text-slate-500 mt-1">Hospital</Text>
                    <Text className="text-sm font-bold text-slate-700" numberOfLines={1}>{item.hospital_name || "Clinic"}</Text>
                </View>
            </View>

            <View className="flex-row">
                <TouchableOpacity 
                    className="flex-1 bg-primary p-3 rounded-xl items-center flex-row justify-center mr-2"
                    onPress={() => openBooking(item, "Video Consult")}
                >
                    <Video size={16} color="white" />
                    <Text className="text-white font-bold text-xs ml-2">Video Consult</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className="flex-1 bg-white border border-primary p-3 rounded-xl items-center flex-row justify-center"
                    onPress={() => openBooking(item, "In-Person Visit")}
                >
                    <MapPin size={16} color="#0284c7" />
                    <Text className="text-primary font-bold text-xs ml-2">Clinic Visit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="px-4 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <View className="ml-2">
                    <Text className="text-xl font-bold text-slate-900">Select Doctor</Text>
                    <Text className="text-sm text-slate-500">Recommended for {disease}</Text>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0284c7" />
                </View>
            ) : (
                <FlatList
                    data={[]}
                    renderItem={() => null}
                    ListHeaderComponent={
                        <View className="p-4">
                            <Text className="text-lg font-bold text-slate-900 mb-4">{category} Specialists</Text>
                            {specialists.length > 0 ? (
                                specialists.map(renderDoctor)
                            ) : (
                                <View className="p-8 bg-white rounded-2xl mb-6 border border-dashed border-gray-200 items-center">
                                    <Text className="text-slate-400 text-center italic">No specialists available for this category right now.</Text>
                                </View>
                            )}

                            <Text className="text-lg font-bold text-slate-900 mb-4 mt-2">General Physicians</Text>
                            {generalists.map(renderDoctor)}
                        </View>
                    }
                    keyExtractor={(_, index) => index.toString()}
                />
            )}

            {/* Booking Modal */}
            <Modal
                visible={bookingModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setBookingModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[70%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-xl font-bold text-slate-900">Select Time Slot</Text>
                                <Text className="text-slate-500">{selectedType} with {selectedDoctor?.full_name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <RNScrollView showsVerticalScrollIndicator={false}>
                            <View className="mb-6">
                                <Text className="text-sm font-bold text-slate-900 mb-3 flex-row items-center">
                                    <CalendarIcon size={16} color="#0f172a" style={{marginRight: 8}} /> Select Date
                                </Text>
                                <View className="flex-row">
                                    {[0, 1, 2, 3].map((offset) => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + offset);
                                        const isSelected = selectedDate.toDateString() === d.toDateString();
                                        return (
                                            <TouchableOpacity 
                                                key={offset}
                                                onPress={() => setSelectedDate(d)}
                                                className={`mr-3 p-3 rounded-xl items-center border ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 border-slate-200'}`}
                                            >
                                                <Text className={`text-xs ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                                    {d.toLocaleDateString([], {weekday: 'short'})}
                                                </Text>
                                                <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                    {d.getDate()}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="text-sm font-bold text-slate-900 mb-3 flex-row items-center">
                                    <Clock size={16} color="#0f172a" style={{marginRight: 8}} /> Available Slots
                                </Text>
                                {isLoadingSlots ? (
                                    <ActivityIndicator size="small" color="#0284c7" className="py-4" />
                                ) : (
                                    <View className="flex-row flex-wrap">
                                        {availableSlots.length > 0 ? (
                                            availableSlots.map((slot) => {
                                                const isSelected = selectedSlot === slot;
                                                return (
                                                    <TouchableOpacity 
                                                        key={slot}
                                                        onPress={() => setSelectedSlot(slot)}
                                                        className={`m-1 px-4 py-3 rounded-xl border ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 border-slate-200'}`}
                                                        style={{ width: '45%' }}
                                                    >
                                                        <Text className={`text-center font-medium ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                                            {slot}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })
                                        ) : (
                                            <View className="p-4 bg-orange-50 border border-orange-100 rounded-xl w-full">
                                                <Text className="text-orange-700 text-center text-xs">
                                                    No slots available for this date. Please try another day.
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity 
                                onPress={handleBook}
                                disabled={isBooking}
                                className={`p-4 rounded-2xl items-center mb-8 ${isBooking ? 'bg-slate-300' : 'bg-blue-600'}`}
                            >
                                <Text className="text-white font-bold text-lg">
                                    {isBooking ? "Booking..." : "Confirm Appointment"}
                                </Text>
                            </TouchableOpacity>
                        </RNScrollView>
                    </View>
                </View>
            </Modal>

            {/* Profile Modal */}
            <Modal
                visible={profileModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setProfileModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[85%]">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-slate-900">Doctor Profile</Text>
                            <TouchableOpacity onPress={() => setProfileModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {selectedProfile && (
                            <RNScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-6">
                                    <View className="bg-blue-100 w-24 h-24 rounded-full items-center justify-center mb-3">
                                        <Text className="text-3xl font-bold text-blue-700">
                                            {selectedProfile.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                        </Text>
                                    </View>
                                    <Text className="text-2xl font-bold text-slate-900">{selectedProfile.full_name}</Text>
                                    <Text className="text-primary font-medium text-base mb-1">{selectedProfile.specialization || "General Physician"}</Text>
                                    {selectedProfile.rahi_id && (
                                        <View className="bg-blue-50 px-2 py-1 rounded border border-blue-100 mb-3">
                                            <Text className="text-blue-700 font-bold text-xs">{selectedProfile.rahi_id}</Text>
                                        </View>
                                    )}
                                    <View className="flex-row items-center bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                        <Star size={16} color="#f59e0b" fill="#f59e0b" />
                                        <Text className="text-sm font-bold text-amber-600 ml-1">
                                            {selectedProfile.avg_rating || "0.0"}
                                        </Text>
                                        <Text className="text-xs text-amber-600/80 ml-1">
                                            ({selectedProfile.review_count || 0} Reviews)
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <View className="items-center flex-1 border-r border-gray-200">
                                        <Briefcase size={20} color="#0284c7" />
                                        <Text className="text-xs text-slate-500 mt-2">Experience</Text>
                                        <Text className="text-sm font-bold text-slate-900">{selectedProfile.experience_years || 0}+ yrs</Text>
                                    </View>
                                    <View className="items-center flex-1">
                                        <Building2 size={20} color="#0284c7" />
                                        <Text className="text-xs text-slate-500 mt-2">Hospital</Text>
                                        <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>{selectedProfile.hospital_name || "Clinic"}</Text>
                                    </View>
                                </View>

                                <View className="mb-6">
                                    <Text className="text-base font-bold text-slate-900 mb-2">About Doctor</Text>
                                    <Text className="text-slate-600 leading-6">
                                        {selectedProfile.profile_summary || `${selectedProfile.full_name} is a highly experienced ${selectedProfile.specialization || 'Physician'} dedicated to providing excellent patient care.`}
                                    </Text>
                                </View>

                                <View className="mb-8">
                                    <Text className="text-base font-bold text-slate-900 mb-4">Patient Reviews</Text>
                                    {isLoadingReviews ? (
                                        <ActivityIndicator size="small" color="#0284c7" />
                                    ) : doctorReviews.length > 0 ? (
                                        doctorReviews.map((review, index) => (
                                            <View key={review.id || index} className="mb-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                <View className="flex-row justify-between items-start mb-2">
                                                    <View className="flex-row items-center">
                                                        <View className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center mr-2">
                                                            <UserIcon size={14} color="#64748b" />
                                                        </View>
                                                        <View>
                                                            <Text className="text-sm font-bold text-slate-700">{review.patient_name}</Text>
                                                            <Text className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</Text>
                                                        </View>
                                                    </View>
                                                    <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                                        <Star size={12} color="#f59e0b" fill="#f59e0b" />
                                                        <Text className="text-xs font-bold text-amber-700 ml-1">{review.rating}</Text>
                                                    </View>
                                                </View>
                                                {review.comment && (
                                                    <Text className="text-slate-600 text-sm mt-1">{review.comment}</Text>
                                                )}
                                            </View>
                                        ))
                                    ) : (
                                        <View className="p-6 bg-slate-50 rounded-xl items-center border border-dashed border-slate-200">
                                            <Text className="text-slate-400 italic text-center">No reviews available for this doctor yet.</Text>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity 
                                    onPress={() => {
                                        setProfileModalVisible(false);
                                        openBooking(selectedProfile, "Video Consult");
                                    }}
                                    className="p-4 rounded-2xl items-center mb-8 bg-blue-600 shadow-sm"
                                >
                                    <Text className="text-white font-bold text-lg">Book Appointment</Text>
                                </TouchableOpacity>
                            </RNScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
