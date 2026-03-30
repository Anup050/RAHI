import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSendOtp = async () => {
    if (!email.includes('@')) {
       Alert.alert("Invalid Email", "Please enter a valid email address");
       return;
    }
    
    setIsLoading(true);
    try {
        await authService.sendLoginEmail(email);
        setIsLoading(false);
        setStep(2);
        Alert.alert("OTP Sent", "Six digit code sent to your email.");
    } catch (error: any) {
        setIsLoading(false);
        Alert.alert("Error", "Failed to send OTP. Ensure email is registered.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
        Alert.alert("Invalid OTP", "Please enter a 6-digit OTP");
        return;
    }

    setIsLoading(true);
    try {
        const response = await authService.verifyLoginEmail(email, otp);
        const mockUser = { name: "Patient User", email: email }; 
        await login(response.access_token, mockUser);
    } catch (error: any) {
        setIsLoading(false);
        console.error(error);
        const message = error.response?.status === 404 
            ? "User not found. Please register first." 
            : "Invalid OTP or failed to verify.";
        Alert.alert("Login Failed", message);
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-white justify-center p-6">
      <Text className="text-3xl font-bold text-blue-600 mb-2">RAHI Health</Text>
      <Text className="text-gray-500 mb-8">Login to continue</Text>

      {step === 1 ? (
        <>
            <View className="mb-6">
                <Text className="text-gray-600 mb-2">Email Address</Text>
                <TextInput 
                className="border border-gray-300 rounded-xl p-4 text-lg"
                placeholder="patient@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                />
            </View>

            <TouchableOpacity 
                className="bg-blue-600 p-4 rounded-xl items-center"
                onPress={handleSendOtp}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Send Login Code</Text>
                )}
            </TouchableOpacity>

            <View className="mt-6 flex-row justify-center">
                <Text className="text-gray-600">Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text className="text-blue-600 font-bold">Register</Text>
                </TouchableOpacity>
            </View>
        </>
      ) : (
        <>
            <View className="mb-6">
                <Text className="text-gray-600 mb-2">Enter 6-Digit Code</Text>
                <TextInput 
                className="border border-gray-300 rounded-xl p-4 text-lg text-center font-bold tracking-widest"
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                />
            </View>

            <TouchableOpacity 
                className="bg-green-600 p-4 rounded-xl items-center mb-4"
                onPress={handleVerifyOtp}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Verify & Login</Text>
                )}
            </TouchableOpacity>

             <TouchableOpacity 
                className="p-4 items-center"
                onPress={() => setStep(1)}
                disabled={isLoading}
            >
                <Text className="text-blue-600 font-medium">Change Email</Text>
            </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}
