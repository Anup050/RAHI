import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// In-memory mock store
let MOCK_PATIENTS = [
  { id: "1", name: "Rohan Das", age: 45, gender: "Male", phone: "+91 98765 43210", lastVisit: "2023-10-15", status: "Active", condition: "Viral Fever" },
  { id: "2", name: "Anjali Sharma", age: 32, gender: "Female", phone: "+91 98123 45678", lastVisit: "2023-10-12", status: "Active", condition: "Pregnancy Checkup" },
  { id: "3", name: "Vikram Singh", age: 58, gender: "Male", phone: "+91 99887 76655", lastVisit: "2023-09-28", status: "Critical", condition: "Cardiac Arrhythmia" },
  { id: "4", name: "Priya Patel", age: 24, gender: "Female", phone: "+91 91234 56789", lastVisit: "2023-10-14", status: "Recovered", condition: "Vaccination" },
  { id: "5", name: "Rahul Kumar", age: 12, gender: "Male", phone: "+91 90000 11111", lastVisit: "2023-10-16", status: "Active", condition: "Stomach Infection" },
  { id: "6", name: "Sita Devi", age: 65, gender: "Female", phone: "+91 88888 22222", lastVisit: "2023-08-10", status: "Inactive", condition: "Hypertension" },
];

export const usePatients = () => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_PATIENTS;
    },
  });
};

export const useRegisterPatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPatient: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const patient = {
        id: Math.random().toString(36).substr(2, 9),
        ...newPatient,
        lastVisit: new Date().toISOString().split('T')[0],
        status: "Active",
        condition: "New Registration"
      };
      MOCK_PATIENTS = [patient, ...MOCK_PATIENTS]; // Add to beginning
      return patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};
