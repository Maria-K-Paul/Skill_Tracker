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
      // Mock data representing 6 labs
      return [
        { id: "1", date: "2024-10-15", time: "09:00 AM", venue: "CSE Lab 1", totalSeats: 50, availableSeats: 12 },
        { id: "2", date: "2024-10-15", time: "09:00 AM", venue: "CSE Lab 2", totalSeats: 50, availableSeats: 0 },
        { id: "3", date: "2024-10-15", time: "02:00 PM", venue: "AI&DS Lab 1", totalSeats: 50, availableSeats: 45 },
      ] as Slot[];
      // Real API:
      // const res = await api.get('/slots');
      // return res.data;
    }
  });
}
