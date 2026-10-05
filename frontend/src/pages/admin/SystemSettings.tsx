import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Plus, Trash2, Calendar, MapPin, Download, Play, Settings, Users } from "lucide-react";

interface Hall {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

interface Slot {
  id: string;
  level_id?: number;
  date?: string;
  start_time: string;
  end_time: string;
  booking_cutoff: string;
  status: string;
}

interface SlotBooking {
  id: string;
  student_id: string;
  attempt_number: number;
  status: string;
}

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState<"halls" | "slots">("halls");
  const [halls, setHalls] = useState<Hall[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Hall form
  const [hallForm, setHallForm] = useState({
    name: "",
    location: "",
    capacity: "",
  });

  // Slot form
  const [slotForm, setSlotForm] = useState({
    level_id: "1",
    start_time: "",
    end_time: "",
    booking_cutoff: "",
  });

  const [selectedHalls, setSelectedHalls] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchHalls(), fetchSlots()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHalls = async () => {
    try {
      const res = await api.get("/halls/");
      console.log("Halls response:", res);
      if (Array.isArray(res.data)) {
        setHalls(res.data);
      } else {
        console.error("Unexpected response format:", res.data);
        setHalls([]);
      }
    } catch (err: any) {
      console.error("Failed to load halls:", err);
      console.error("Error details:", err.response?.data);
      setMessage({
        type: "error",
        text: `Failed to load halls: ${err.response?.data?.detail || err.message}`,
      });
      setHalls([]);
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await api.get("/slots/admin");
      setSlots(res.data || []);
    } catch (err) {
      console.error("Failed to load slots:", err);
      setSlots([]);
    }
  };

  const handleCreateHall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post("/halls/", {
        name: hallForm.name,
        location: hallForm.location,
        capacity: parseInt(hallForm.capacity),
      });

      setMessage({ type: "success", text: "Hall created successfully!" });
      setHallForm({ name: "", location: "", capacity: "" });
      await fetchHalls();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to create hall",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHall = async (hallId: number, hallName: string) => {
    if (!confirm(`Delete hall "${hallName}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/halls/${hallId}`);
      setMessage({ type: "success", text: `Hall "${hallName}" deleted!` });
      await fetchHalls();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to delete hall",
      });
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const slotRes = await api.post("/slots/admin/", {
        level_id: parseInt(slotForm.level_id),
        start_time: new Date(slotForm.start_time).toISOString(),
        end_time: new Date(slotForm.end_time).toISOString(),
        booking_cutoff: new Date(slotForm.booking_cutoff).toISOString(),
      });

      const newSlotId = slotRes.data.id;

      for (const hallId of selectedHalls) {
        await api.post(`/slots/admin/${newSlotId}/halls`, { hall_id: hallId });
      }

      setMessage({ type: "success", text: "Slot created and halls linked!" });
      setSlotForm({
        level_id: "1",
        start_time: "",
        end_time: "",
        booking_cutoff: "",
      });
      setSelectedHalls([]);
      await fetchSlots();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to create slot",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewBookings = async (slot: Slot) => {
    setSelectedSlot(slot);
    try {
      const res = await api.get(`/slots/admin/${slot.id}/bookings`);
      setBookings(res.data || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setBookings([]);
    }
  };

  const handleRunAllocation = async (slotId: string) => {
    if (!confirm("Run allocation? Students will be randomly assigned to halls.")) return;

    setLoading(true);
    try {
      const res = await api.post(`/allocation/${slotId}/run`);
      setMessage({ type: "success", text: res.data.message });
      await fetchSlots();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to run allocation",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHallSheet = async (slotId: string, hallId: number, hallName: string) => {
    try {
      const res = await api.get(`/hall-sheets/${slotId}/${hallId}/download-pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `hall_sheet_${hallName}_${slotId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage({ type: "success", text: `Hall sheet for ${hallName} downloaded!` });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to download hall sheet",
      });
    }
  };

  const toggleHallSelection = (hallId: number) => {
    setSelectedHalls((prev) =>
      prev.includes(hallId) ? prev.filter((id) => id !== hallId) : [...prev, hallId]
    );
  };

  if (loading && halls.length === 0 && slots.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading system settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings & Slot Management</h1>
        <p className="text-muted">Manage halls, create exam slots, and handle allocations</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => {
            setActiveTab("halls");
            setMessage(null);
          }}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "halls"
              ? "border-b-2 border-primary text-primary"
              : "text-muted hover:text-primary"
          }`}
        >
          <MapPin className="inline w-4 h-4 mr-2" />
          Halls & Venues
        </button>
        <button
          onClick={() => {
            setActiveTab("slots");
            setMessage(null);
          }}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "slots"
              ? "border-b-2 border-primary text-primary"
              : "text-muted hover:text-primary"
          }`}
        >
          <Calendar className="inline w-4 h-4 mr-2" />
          Exam Slots
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Halls Tab */}
      {activeTab === "halls" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Hall</CardTitle>
              <CardDescription>Add exam venues/halls to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateHall} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hall-name">Hall Name *</Label>
                    <Input
                      id="hall-name"
                      placeholder="e.g., Hall A"
                      value={hallForm.name}
                      onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hall-location">Location *</Label>
                    <Input
                      id="hall-location"
                      placeholder="e.g., CS Block, 2nd Floor"
                      value={hallForm.location}
                      onChange={(e) => setHallForm({ ...hallForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hall-capacity">Capacity *</Label>
                    <Input
                      id="hall-capacity"
                      type="number"
                      min="1"
                      placeholder="e.g., 50"
                      value={hallForm.capacity}
                      onChange={(e) => setHallForm({ ...hallForm, capacity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Hall
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Halls</CardTitle>
              <CardDescription>
                {halls.length === 0 ? "No halls created yet" : `${halls.length} hall(s) available`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {halls.length === 0 ? (
                <p className="text-center py-8 text-muted">No halls found. Create one above.</p>
              ) : (
                <div className="space-y-3">
                  {halls.map((hall) => (
                    <div
                      key={hall.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">{hall.name}</h3>
                        <p className="text-sm text-muted">
                          📍 {hall.location} • 👥 Capacity: {hall.capacity}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteHall(hall.id, hall.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Slots Tab */}
      {activeTab === "slots" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Exam Slot</CardTitle>
              <CardDescription>
                Schedule exam slots with date, time, and halls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSlot} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time *</Label>
                    <Input
                      id="start-time"
                      type="datetime-local"
                      value={slotForm.start_time}
                      onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time *</Label>
                    <Input
                      id="end-time"
                      type="datetime-local"
                      value={slotForm.end_time}
                      onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="cutoff">Booking Cutoff *</Label>
                    <Input
                      id="cutoff"
                      type="datetime-local"
                      value={slotForm.booking_cutoff}
                      onChange={(e) => setSlotForm({ ...slotForm, booking_cutoff: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Halls *</Label>
                  {halls.length === 0 ? (
                    <p className="text-sm text-muted border border-border rounded-lg p-4">
                      No halls available. Create halls first in the "Halls & Venues" tab.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {halls.map((hall) => (
                        <label
                          key={hall.id}
                          className="flex items-center space-x-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary"
                        >
                          <input
                            type="checkbox"
                            checked={selectedHalls.includes(hall.id)}
                            onChange={() => toggleHallSelection(hall.id)}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{hall.name}</div>
                            <div className="text-xs text-muted">Cap: {hall.capacity}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted">
                    Selected: {selectedHalls.length} hall(s) | Total capacity:{" "}
                    {selectedHalls.reduce(
                      (sum, id) => sum + (halls.find((h) => h.id === id)?.capacity || 0),
                      0
                    )}
                  </p>
                </div>

                <Button type="submit" disabled={loading || selectedHalls.length === 0}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Slot
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Slots</CardTitle>
              <CardDescription>
                {slots.length === 0 ? "No slots created yet" : `${slots.length} slot(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {slots.length === 0 ? (
                <p className="text-center py-8 text-muted">No slots found. Create one above.</p>
              ) : (
                <div className="space-y-4">
                  {slots.map((slot) => (
                    <Card key={slot.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              Slot {slot.id.substring(0, 8)}
                            </CardTitle>
                            <p className="text-sm text-muted">
                              {slot.start_time} - {slot.end_time}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm">
                            {slot.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewBookings(slot)}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            View Bookings
                          </Button>
                          <Button size="sm" onClick={() => handleRunAllocation(slot.id)}>
                            <Play className="w-4 h-4 mr-1" />
                            Run Allocation
                          </Button>
                        </div>

                        {selectedSlot?.id === slot.id && (
                          <div className="border-t pt-3 mt-3">
                            <p className="text-sm font-medium mb-2">
                              Bookings: {bookings.length}
                            </p>
                            <div className="space-y-2 mb-3">
                              <p className="text-sm font-medium">Download Hall Sheets:</p>
                              <div className="flex flex-wrap gap-2">
                                {halls.map((hall) => (
                                  <Button
                                    key={hall.id}
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDownloadHallSheet(slot.id, hall.id, hall.name)
                                    }
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    {hall.name}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
