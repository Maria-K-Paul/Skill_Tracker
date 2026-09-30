import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { useSlots } from "../../hooks/useSlots";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { CardSkeleton } from "../../components/ui/skeleton";

export function SlotBooking() {
  const { user } = useAuth();
  const { data: slots, isLoading } = useSlots();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const testName = location.state?.testName || "Level 2 Main Exam";
  const domain = location.state?.domain || "Full Stack";

  const handleBook = () => {
    const slot = slots?.find(s => s.id === selectedSlot);
    if (slot && user) {
      const bookedData = {
        testName,
        domain,
        date: format(new Date(slot.date), 'MMM dd, yyyy'),
        time: slot.time,
        venue: "Lab 4, Computer Science Block", // Auto-allotted by backend
      };
      localStorage.setItem(`bookedSlot_${user.id}`, JSON.stringify(bookedData));
    }
    setIsConfirmOpen(false);
    navigate("/student/upcoming-test");
  };

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
            <Card key={slot.id} className={`transition-all ${slot.availableSeats === 0 ? 'opacity-50' : 'cursor-pointer'} ${selectedSlot === slot.id ? 'ring-2 ring-accent ring-offset-2' : ''}`} onClick={() => slot.availableSeats > 0 && setSelectedSlot(slot.id)}>
              <CardContent className="p-5 text-center flex flex-col items-center justify-center h-32">
                <div className="mb-1 text-[16px] font-medium text-primary">
                  {format(new Date(slot.date), 'MMM dd')}
                </div>
                <div className="mb-2 text-[14px] font-medium text-muted">
                  {slot.time}
                </div>
                <div className="text-[12px] text-muted flex items-center justify-center">
                  <Users className="mr-1.5 h-3.5 w-3.5" /> {slot.availableSeats} / {slot.totalSeats} seats
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
              You are about to book the slot for {slots?.find(s => s.id === selectedSlot)?.date} at {slots?.find(s => s.id === selectedSlot)?.time}.
              <br/><br/>
              <strong>Note:</strong> The exact venue will be allotted automatically and displayed in the "Upcoming Test" section after booking.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleBook}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
