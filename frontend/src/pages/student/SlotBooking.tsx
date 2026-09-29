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
        <div>Loading slots...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {slots?.map(slot => (
            <Card key={slot.id} className={`transition-all ${slot.availableSeats === 0 ? 'opacity-50' : 'cursor-pointer hover:border-primary'} ${selectedSlot === slot.id ? 'ring-2 ring-primary ring-offset-2' : ''}`} onClick={() => slot.availableSeats > 0 && setSelectedSlot(slot.id)}>
              <CardContent className="p-5 text-center">
                <div className="mb-2 text-xl font-bold">
                  {format(new Date(slot.date), 'MMM dd')}
                </div>
                <div className="mb-4 text-lg font-medium text-primary">
                  {slot.time}
                </div>
                <div className="space-y-2 text-sm text-muted-foreground flex justify-center">
                  <div className="flex items-center"><Users className="mr-2 h-4 w-4" /> {slot.availableSeats} / {slot.totalSeats} seats left</div>
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
