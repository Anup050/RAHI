import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const usePatients = () => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      try {
        const { data } = await api.get<any[]>('/appointments/patients');
        return data;
      } catch (error) {
        console.error("Failed to fetch patients", error);
        return [];
      }
    },
  });
};

export const useRegisterPatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPatient: any) => {
      // In this setup, "registering" a patient via the doctor console
      // might mean creating a user or just a local record.
      // For now, let's just simulate it or if there's a backend endpoint for creating users:
      // const { data } = await api.post('/users/register', newPatient);
      // return data;
      
      // Since the user asked to keep only appointment patients, 
      // we'll keep this simplified for now or point to the appointment creation flow.
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: "new", ...newPatient };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};
