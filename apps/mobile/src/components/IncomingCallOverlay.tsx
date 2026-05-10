import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Vibration } from 'react-native';
import { Phone, PhoneOff, User } from 'lucide-react-native';
import { Audio } from 'expo-av';

interface IncomingCallOverlayProps {
    visible: boolean;
    callerName: string;
    onAccept: () => void;
    onDecline: () => void;
}

export default function IncomingCallOverlay({ visible, callerName, onAccept, onDecline }: IncomingCallOverlayProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            startRinging();
            startAnimation();
            Vibration.vibrate([500, 1000, 500, 1000], true);
        } else {
            stopRinging();
            Vibration.cancel();
        }
        return () => {
            stopRinging();
            Vibration.cancel();
        };
    }, [visible]);

    const startRinging = async () => {
        try {
            const { sound: ringtone } = await Audio.Sound.createAsync(
                // Using a remote sound for demo, user should replace with local asset
                { uri: 'https://www.soundjay.com/phone/phone-calling-1.mp3' }
            );
            setSound(ringtone);
            await ringtone.setIsLoopingAsync(true);
            await ringtone.playAsync();
        } catch (error) {
            console.log('Error playing ringtone', error);
        }
    };

    const stopRinging = async () => {
        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
        }
    };

    const startAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.container}>
                <View style={styles.content}>
                    <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
                        <View style={styles.avatar}>
                            <User size={60} color="white" />
                        </View>
                    </Animated.View>
                    
                    <Text style={styles.incomingText}>Incoming Consultation...</Text>
                    <Text style={styles.callerName}>{callerName}</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity 
                            onPress={onDecline} 
                            style={[styles.button, styles.declineButton]}
                        >
                            <PhoneOff size={30} color="white" />
                            <Text style={styles.buttonText}>Decline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={onAccept} 
                            style={[styles.button, styles.acceptButton]}
                        >
                            <Phone size={30} color="white" />
                            <Text style={styles.buttonText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    avatarContainer: {
        marginBottom: 30,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#0284c7',
    },
    incomingText: {
        color: '#94a3b8',
        fontSize: 16,
        marginBottom: 10,
    },
    callerName: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 80,
    },
    actions: {
        flexDirection: 'row',
        gap: 60,
    },
    button: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    declineButton: {
        backgroundColor: '#ef4444',
    },
    acceptButton: {
        backgroundColor: '#22c55e',
    },
    buttonText: {
        color: 'white',
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
    }
});
