import api from './api';

export const userService = {
    updateProfile: async (data: { full_name?: string; age?: number; phone_number?: string; gender?: string; push_token?: string }) => {
        const response = await api.put('/users/me', data);
        return response.data;
    }
};
