import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Slot {
  id: string;
  date: string;
  time: string;
  venue: string;
  totalSeats: number;
  availableSeats: number;
}

export function useSlots() {
  return useQuery({
    queryKey: ['exam-slots'],
    queryFn: async () => {
      const res = await api.get('/slots/student/available');
      return res.data;
    }
  });
}
