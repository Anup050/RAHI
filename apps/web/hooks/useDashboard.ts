import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface DashboardStats {
  appointments_count: number;
  pending_requests: number;
  total_patients: number;
  avg_wait_time: string;
}

export interface ActivityItem {
  id: string;
  patient_name: string;
  type: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Mock data for demonstration - Uncomment API call when backend is ready
      // try {
      //   const { data } = await api.get<DashboardStats>('/v1/analytics/dashboard');
      //   return data;
      // } catch (error) {
         return {
            appointments_count: 12,
            pending_requests: 5,
            total_patients: 1240,
            avg_wait_time: "14m"
         };
      // }
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      // Mock data for demonstration - Uncomment API call when backend is ready
      // try {
      //   const { data } = await api.get<ActivityItem[]>('/v1/appointments?limit=5&sort=desc');
      //   return data;
      // } catch (error) {
         return [
            { id: "APT-001", patient_name: "Rohan Das", type: "General Checkup", time: "10:00 AM", status: "completed" },
            { id: "APT-002", patient_name: "Anjali Sharma", type: "Follow-up", time: "10:30 AM", status: "in_progress" },
            { id: "APT-003", patient_name: "Vikram Singh", type: "Emergency", time: "11:15 AM", status: "pending" },
            { id: "APT-004", patient_name: "Priya Patel", type: "Vaccination", time: "11:45 AM", status: "confirmed" },
            { id: "APT-005", patient_name: "Rahul Kumar", type: "Consultation", time: "12:15 PM", status: "pending" },
         ] as ActivityItem[];
      // }
    },
  });
};

export const useGlobalSearch = (query: string) => {
  return useQuery({
    queryKey: ['globalSearch', query],
    queryFn: async () => {
      if (!query) return [];
      const { data } = await api.get(`/v1/search?q=${query}`);
      return data;
    },
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60, // Cache results for 1 minute
  });
};
