import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { useSlots, type Slot } from "../../hooks/useSlots";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { CardSkeleton } from "../../components/ui/skeleton";
import { api } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";

function formatSlotDate(slot: Slot): string {
  if (!slot.date) return "TBD";
  return format(new Date(slot.date + "T00:00:00"), "MMM dd, yyyy");
}

function formatSlotDateShort(slot: Slot): string {
  if (!slot.date) return "TBD";
  return format(new Date(slot.date + "T00:00:00"), "MMM dd");
}

function formatSlotTime(slot: Slot): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };
  return `${fmt(slot.start_time)} - ${fmt(slot.end_time)}`;
}

export function SlotBooking() {
  const { user } = useAuth();
  const { data: slots, isLoading } = useSlots();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const testName = location.state?.testName || "Level 2 Main Exam";
  const domain = location.state?.domain || "Full Stack";

  const queryClient = useQueryClient();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    setBookingError(null);
    try {
      await api.post('/slots/student/book', { slot_id: selectedSlot });
      queryClient.invalidateQueries({ queryKey: ['exam-slots'] });
      setIsConfirmOpen(false);
      navigate("/student/upcoming-test");
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message || "Booking failed. Please try again.";
      setBookingError(detail);
    } finally {
      setIsBooking(false);
    }
  };

  const selected = slots?.find(s => s.id === selectedSlot);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={`Book Slot: ${testName}`}
        description="Select an available time slot for your examination."
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !slots || slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Calendar className="h-16 w-16 text-muted" strokeWidth={1} />
          <p className="text-muted text-sm">No open slots available for this test currently.</p>
          <Button variant="default" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {slots.map(slot => (
            <Card key={slot.id} className={`transition-all ${slot.available_seats === 0 ? 'opacity-50' : 'cursor-pointer'} ${selectedSlot === slot.id ? 'ring-2 ring-accent ring-offset-2' : ''}`} onClick={() => slot.available_seats > 0 && setSelectedSlot(slot.id)}>
              <CardContent className="p-5 text-center flex flex-col items-center justify-center h-32">
                <div className="mb-1 text-[16px] font-medium text-primary">
                  {formatSlotDateShort(slot)}
                </div>
                <div className="mb-2 text-[14px] font-medium text-muted">
                  {formatSlotTime(slot)}
                </div>
                <div className="text-[12px] text-muted flex items-center justify-center">
                  <Users className="mr-1.5 h-3.5 w-3.5" /> {slot.available_seats} / {slot.total_capacity} seats
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button size="lg" disabled={!selectedSlot} onClick={() => setIsConfirmOpen(true)}>Review & Book</Button>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              {selected && (
                <>
                  You are about to book the slot for {formatSlotDate(selected)} at {formatSlotTime(selected)}.
                </>
              )}
              <br/><br/>
              <strong>Note:</strong> The exact venue will be allotted automatically and displayed in the "Upcoming Test" section after booking.
            </DialogDescription>
          </DialogHeader>
          {bookingError && (
            <p className="text-sm text-red-600 mt-2">{bookingError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsConfirmOpen(false); setBookingError(null); }}>Cancel</Button>
            <Button onClick={handleBook} disabled={isBooking}>{isBooking ? "Booking..." : "Confirm Booking"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
