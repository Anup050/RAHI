import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface DashboardStats {
  appointments_count: number;
  pending_requests: number;
  confirmed_requests: number;
  completed_requests: number;
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
      try {
        const { data } = await api.get<DashboardStats>('/analytics/dashboard');
        return data;
      } catch (error) {
         console.error("Dashboard stats fetch failed", error);
         return {
            appointments_count: 0,
            pending_requests: 0,
            confirmed_requests: 0,
            completed_requests: 0,
            total_patients: 0,
            avg_wait_time: "--"
         };
      }
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      try {
        const { data } = await api.get<any[]>('/appointments?limit=5');
        // Map backend fields to frontend interface if necessary
        return data.map(item => ({
          ...item,
          status: item.status.toLowerCase()
        })) as ActivityItem[];
      } catch (error) {
         console.error("Recent activity fetch failed", error);
         return [];
      }
    },
  });
};

export const useGlobalSearch = (query: string) => {
  return useQuery({
    queryKey: ['globalSearch', query],
    queryFn: async () => {
      if (!query) return [];
      const { data } = await api.get(`/search?q=${query}`);
      return data;
    },
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60, // Cache results for 1 minute
  });
};
