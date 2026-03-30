
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/auth';

export default function SignupScreen({ navigation }: any) {
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const handleRegisterRequest = async () => {
    if (!email || !fullName || !password) {
       Alert.alert("Missing Fields", "Please fill in all details.");
       return;
    }
    
    setIsLoading(true);
    try {
        await authService.registerRequest({
            email,
            full_name: fullName,
            password,
            age: age ? parseInt(age) : null,
            role: "patient", // Force patient role for mobile app
            phone_number: ""
        });
        setIsLoading(false);
        setStep(2);
        Alert.alert("OTP Sent", "Six digit code sent to your email.");
    } catch (error: any) {
        setIsLoading(false);
        console.error(error);
        const msg = error.response?.data?.detail || "Registration failed";
        Alert.alert("Error", msg);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
        Alert.alert("Invalid OTP", "Please enter a 6-digit OTP");
        return;
    }

    setIsLoading(true);
    try {
        await authService.registerVerify(email, otp);
        setIsLoading(false);
        Alert.alert("Success", "Account verified! Please login.", [
            { text: "OK", onPress: () => navigation.navigate("Login") }
        ]);
    } catch (error: any) {
        setIsLoading(false);
        console.error(error);
        const msg = error.response?.data?.detail || "Verification failed";
        Alert.alert("Error", msg);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Text className="text-3xl font-bold text-blue-600 mb-2">Create Account</Text>
        <Text className="text-gray-500 mb-8">Join RAHI Health today</Text>

        {step === 1 ? (
          <>
              <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Full Name</Text>
                  <TextInput 
                    className="border border-gray-300 rounded-xl p-4 text-lg"
                    placeholder="John Doe"
                    value={fullName}
                    onChangeText={setFullName}
                  />
              </View>

              <View className="mb-4">
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

              <View className="mb-6">
                  <Text className="text-gray-600 mb-2">Password</Text>
                  <TextInput 
                    className="border border-gray-300 rounded-xl p-4 text-lg"
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
              </View>

              <View className="mb-6">
                  <Text className="text-gray-600 mb-2">Age</Text>
                  <TextInput 
                    className="border border-gray-300 rounded-xl p-4 text-lg"
                    placeholder="25"
                    keyboardType="number-pad"
                    value={age}
                    onChangeText={setAge}
                  />
              </View>

              <TouchableOpacity 
                  className="bg-blue-600 p-4 rounded-xl items-center"
                  onPress={handleRegisterRequest}
                  disabled={isLoading}
              >
                  {isLoading ? (
                      <ActivityIndicator color="white" />
                  ) : (
                      <Text className="text-white font-bold text-lg">Continue</Text>
                  )}
              </TouchableOpacity>
          </>
        ) : (
          <>
              <View className="mb-6">
                  <Text className="text-gray-600 mb-2">Enter Verification Code</Text>
                  <Text className="text-sm text-gray-500 mb-2">Sent to {email}</Text>
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
                      <Text className="text-white font-bold text-lg">Verify & Register</Text>
                  )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                  className="p-4 items-center"
                  onPress={() => setStep(1)}
                  disabled={isLoading}
              >
                  <Text className="text-blue-600 font-medium">Back to Details</Text>
              </TouchableOpacity>
          </>
        )}

        <View className="mt-8 flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-blue-600 font-bold">Login</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
