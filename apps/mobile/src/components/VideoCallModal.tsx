import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Alert, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, ExternalLink } from 'lucide-react-native';
import { Camera } from 'expo-camera';
import api from '../services/api';

interface VideoCallModalProps {
    appointmentId: number | null;
    visible: boolean;
    onClose: () => void;
}

export default function VideoCallModal({ appointmentId, visible, onClose }: VideoCallModalProps) {
    const [sessionInfo, setSessionInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            requestPermissions();
            if (appointmentId) {
                fetchSessionInfo();
            }
        } else {
            setSessionInfo(null);
        }
    }, [visible, appointmentId]);

    const requestPermissions = async () => {
        try {
            const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
            const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
            
            if (camStatus !== 'granted' || micStatus !== 'granted') {
                Alert.alert(
                    "Permissions Required",
                    "Camera and Microphone permissions are needed for video calls. Please enable them in your device settings.",
                    [{ text: "OK" }]
                );
            }
        } catch (error) {
            console.error("Error requesting permissions", error);
        }
    };

    const fetchSessionInfo = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/video/${appointmentId}/session`);
            setSessionInfo(response.data);
        } catch (error) {
            console.error("Failed to fetch video session", error);
            Alert.alert("Error", "Failed to connect to secure video server.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenInApp = () => {
        if (!sessionInfo) return;
        // Jitsi Meet app uses a specific URL scheme or just the web URL which it intercepts
        // We use the same room name and domain
        const url = `https://${sessionInfo.domain}/${sessionInfo.room_name}${sessionInfo.token ? `?jwt=${sessionInfo.token}` : ''}`;
        Linking.openURL(url).catch(err => {
            console.error("Failed to open Jitsi App", err);
            Alert.alert("Error", "Could not open Jitsi Meet app. Please make sure it is installed.");
        });
    };

    if (!visible) return null;

    // Construct the Jitsi URL
    // Placing JWT as a query parameter and config as a fragment
    const jitsiUrl = sessionInfo ? 
        `https://${sessionInfo.domain}/${sessionInfo.room_name}${sessionInfo.token ? `?jwt=${sessionInfo.token}` : ''}#jitsi_meet_external_api_id=0&userInfo.displayName="${encodeURIComponent(sessionInfo.user_name)}"&config.prejoinPageEnabled=false&config.disableThirdPartyRequests=true&config.disableDeepLinking=true&config.defaultLanguage="en"&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false` 
        : '';

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Secure Consultation</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={handleOpenInApp} style={styles.actionButton} accessibilityLabel="Open in Jitsi Meet App">
                            <ExternalLink size={20} color="#0284c7" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.webviewContainer}>
                    {loading ? (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color="#0284c7" />
                            <Text style={styles.loaderText}>Connecting to secure room...</Text>
                        </View>
                    ) : (
                        <WebView
                            source={{ uri: jitsiUrl }}
                            style={styles.webview}
                            allowsInlineMediaPlayback={true}
                            mediaPlaybackRequiresUserAction={false}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            originWhitelist={['*']}
                            userAgent="Mozilla/5.0 (Linux; Android 10; Android SDK built for x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36"
                            mixedContentMode="always"
                            onPermissionRequest={(request: any) => {
                                request.grant(request.resources);
                            }}
                            onShouldStartLoadWithRequest={(request: any) => {
                                // If it's a deep link (like intent:// or org.jitsi.meet://)
                                if (!request.url.startsWith('http') && !request.url.startsWith('https')) {
                                    Linking.openURL(request.url).catch(err => {
                                        console.warn("Failed to open deep link", err);
                                    });
                                    return false; // Prevent WebView from loading it
                                }
                                return true;
                            }}
                            onMessage={(event) => {
                                console.log("Jitsi Event:", event.nativeEvent.data);
                            }}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    actionButton: {
        padding: 4,
    },
    closeButton: {
        padding: 4,
    },
    webviewContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    webview: {
        flex: 1,
    },
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    loaderText: {
        marginTop: 12,
        color: '#64748b',
        fontSize: 16,
    },
});
