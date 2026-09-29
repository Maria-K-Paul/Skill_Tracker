import { useState, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export function SystemSettings() {
  const [slots, setSlots] = useState<any[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newCapacity, setNewCapacity] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("mockGlobalSlots");
    if (saved) {
      setSlots(JSON.parse(saved));
    } else {
      const defaultSlots = [
        { id: "S1", date: "Oct 15, 2026", time: "10:00 AM", venue: "Lab 4, CS Block", capacity: 50 },
        { id: "S2", date: "Oct 15, 2026", time: "02:00 PM", venue: "Lab 2, IT Block", capacity: 50 },
        { id: "S3", date: "Oct 16, 2026", time: "10:00 AM", venue: "Lab 1, CS Block", capacity: 50 },
      ];
      setSlots(defaultSlots);
      localStorage.setItem("mockGlobalSlots", JSON.stringify(defaultSlots));
    }
  }, []);

  const saveSlots = (newSlots: any[]) => {
    setSlots(newSlots);
    localStorage.setItem("mockGlobalSlots", JSON.stringify(newSlots));
  };

  const handleAddSlot = () => {
    if (!newDate || !newTime || !newVenue || !newCapacity) return;
    
    const newSlot = {
      id: `S${Date.now()}`,
      date: newDate,
      time: newTime,
      venue: newVenue,
      capacity: parseInt(newCapacity, 10),
    };
    
    saveSlots([...slots, newSlot]);
    setNewDate("");
    setNewTime("");
    setNewVenue("");
    setNewCapacity("");
  };

  const handleRemoveSlot = (id: string) => {
    saveSlots(slots.filter(s => s.id !== id));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader 
        title="Slot Settings" 
        description="Configure exam slots, venues, and capacities for the institution."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add New Exam Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap items-end">
            <div className="space-y-2 flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Date</label>
              <Input placeholder="e.g., Oct 20, 2026" value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>
            <div className="space-y-2 flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Time</label>
              <Input placeholder="e.g., 10:00 AM" value={newTime} onChange={e => setNewTime(e.target.value)} />
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Venue</label>
              <Input placeholder="e.g., Lab 3, IT Block" value={newVenue} onChange={e => setNewVenue(e.target.value)} />
            </div>
            <div className="space-y-2 flex-1 min-w-[100px]">
              <label className="text-sm font-medium">Capacity</label>
              <Input type="number" placeholder="50" value={newCapacity} onChange={e => setNewCapacity(e.target.value)} />
            </div>
            <Button onClick={handleAddSlot}>
              <Plus className="mr-2 h-4 w-4" /> Add Slot
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configured Slots</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">{slot.date}</TableCell>
                  <TableCell>{slot.time}</TableCell>
                  <TableCell>{slot.venue}</TableCell>
                  <TableCell>{slot.capacity} Students</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveSlot(slot.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {slots.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No slots configured. Add one above.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
