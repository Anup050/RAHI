import api from './api';

export const authService = {
    // SMS OTP (Deprecated/Backup)
    sendOtp: async (phoneNumber: string) => {
        const response = await api.post('/otp/send', {
            phone_number: phoneNumber
        });
        return response.data;
    },

    verifyOtp: async (phoneNumber: string, otp: string) => {
        const response = await api.post('/otp/verify', {
            phone_number: phoneNumber,
            otp: otp
        });
        return response.data;
    },

    // Email OTP
    sendLoginEmail: async (email: string) => {
        const response = await api.post('/auth/login-request', { email });
        return response.data;
    },

    verifyLoginEmail: async (email: string, otp: string) => {
        const response = await api.post('/auth/login-verify', { email, otp });
        return response.data;
    },

    // Registration
    registerRequest: async (userData: any) => {
        const response = await api.post('/auth/register-request', userData);
        return response.data;
    },

    registerVerify: async (email: string, otp: string) => {
        const response = await api.post('/auth/register-verify', { email, otp });
        return response.data;
    }
};
