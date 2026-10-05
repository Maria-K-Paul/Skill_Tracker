import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Slot {
  id: number;
  start_time: string;
  end_time: string;
  booking_cutoff: string;
  status: string;
  date: string | null;
  total_capacity: number;
  available_seats: number;
}

export function useSlots() {
  return useQuery<Slot[]>({
    queryKey: ['exam-slots'],
    queryFn: async () => {
      const res = await api.get('/slots/student/available');
      return res.data;
    }
  });
}
