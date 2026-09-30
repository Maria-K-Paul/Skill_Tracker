import { useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Key, Search, Download, FileText, AlertCircle } from "lucide-react";

interface Student {
  id: number;
  full_name: string;
  email: string;
  student: {
    roll_number: string;
    reg_num: string;
    curr_sem: number;
  };
}

interface Hall {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
}

export function KeyGeneration() {
  const [searchType, setSearchType] = useState<"roll" | "hall">("roll");
  const [rollNumber, setRollNumber] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedHall, setSelectedHall] = useState("");
  const [halls, setHalls] = useState<Hall[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSearchByRoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim()) {
      setMessage({ type: "error", text: "Please enter a roll number" });
      return;
    }

    setLoading(true);
    setMessage(null);
    setFoundStudent(null);

    try {
      const res = await api.get("/users", {
        params: { q: rollNumber.trim(), limit: 10 },
      });

      if (!res.data.items || res.data.items.length === 0) {
        setMessage({ type: "error", text: `No student found with roll number: ${rollNumber}` });
        setLoading(false);
        return;
      }

      const student = res.data.items.find((s: any) =>
        s.student?.roll_number?.toLowerCase() === rollNumber.trim().toLowerCase()
      );

      if (!student) {
        setMessage({ type: "error", text: `No student found with exact roll number: ${rollNumber}` });
        setLoading(false);
        return;
      }

      setFoundStudent(student);
      setMessage({ type: "success", text: "Student found! Their secret key will be available after slot allocation." });
    } catch (err: any) {
      console.error("Search error:", err);
      setMessage({ type: "error", text: err.response?.data?.detail || "Failed to search for student" });
    } finally {
      setLoading(false);
    }
  };

  const loadHallsAndSlots = async () => {
    try {
      setLoading(true);
      const [hallsRes, slotsRes] = await Promise.all([
        api.get("/halls/"),
        api.get("/slots/admin/"),
      ]);
      setHalls(hallsRes.data || []);
      setSlots(slotsRes.data || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedSlot || !selectedHall) {
      setMessage({ type: "error", text: "Please select both slot and hall" });
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/hall-sheets/${selectedSlot}/${selectedHall}/download-pdf`, {
        responseType: "blob",
      });

      const hall = halls.find((h) => h.id.toString() === selectedHall);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `hall_sheet_${hall?.name || "hall"}_${selectedSlot}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage({ type: "success", text: "PDF downloaded successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Failed to download PDF" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!selectedSlot || !selectedHall) {
      setMessage({ type: "error", text: "Please select both slot and hall" });
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/hall-sheets/${selectedSlot}/${selectedHall}/print`);

      // Convert JSON to CSV
      const data = res.data.rows;
      if (!data || data.length === 0) {
        setMessage({ type: "error", text: "No data available for this hall" });
        setLoading(false);
        return;
      }

      const headers = ["Seat No", "Student ID", "Student Name", "Attempt", "Secret Code"];
      const csvRows = [
        headers.join(","),
        ...data.map((row: any) =>
          [
            row.seat_no,
            row.student_id,
            row.student_display_name,
            row.attempt_number,
            row.secret_code,
          ].join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const hall = halls.find((h) => h.id.toString() === selectedHall);
      link.href = url;
      link.setAttribute("download", `hall_sheet_${hall?.name || "hall"}_${selectedSlot}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage({ type: "success", text: "CSV downloaded successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Failed to download CSV" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Key Generation & Management</h1>
        <p className="text-muted">Search student keys or download hall-wise reports</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => {
            setSearchType("roll");
            setMessage(null);
          }}
          className={`pb-2 px-4 font-medium transition-colors ${
            searchType === "roll"
              ? "border-b-2 border-primary text-primary"
              : "text-muted hover:text-primary"
          }`}
        >
          <Search className="inline w-4 h-4 mr-2" />
          Search by Roll Number
        </button>
        <button
          onClick={() => {
            setSearchType("hall");
            setMessage(null);
            if (halls.length === 0) loadHallsAndSlots();
          }}
          className={`pb-2 px-4 font-medium transition-colors ${
            searchType === "hall"
              ? "border-b-2 border-primary text-primary"
              : "text-muted hover:text-primary"
          }`}
        >
          <Download className="inline w-4 h-4 mr-2" />
          Download Hall Reports
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search by Roll Number Tab */}
      {searchType === "roll" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Student Secret Key</CardTitle>
              <CardDescription>Enter student roll number to find their exam key</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearchByRoll} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="roll">Roll Number</Label>
                    <Input
                      id="roll"
                      placeholder="e.g., 22CS101"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={loading || !rollNumber.trim()}>
                      <Search className="w-4 h-4 mr-2" />
                      {loading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {foundStudent && (
            <Card className="border-primary">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  <CardTitle>Student Found</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted mb-1">Student Name</p>
                    <p className="font-semibold">{foundStudent.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Roll Number</p>
                    <p className="font-semibold">{foundStudent.student?.roll_number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Registration Number</p>
                    <p className="font-semibold">{foundStudent.student?.reg_num || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Semester</p>
                    <p className="font-semibold">{foundStudent.student?.curr_sem || "N/A"}</p>
                  </div>
                </div>

                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Secret Key Status</p>
                      <p className="text-muted mt-1">
                        Secret keys are generated after slot allocation.
                        To view this student's key, download the hall report after running allocation.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Download Hall Reports Tab */}
      {searchType === "hall" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Download Hall-wise Reports</CardTitle>
              <CardDescription>
                Download student lists with secret keys for specific halls (PDF or CSV format)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slot-select">Select Slot</Label>
                  <select
                    id="slot-select"
                    className="w-full border border-border rounded-lg px-3 py-2"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                  >
                    <option value="">-- Select Slot --</option>
                    {slots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.start_time} ({slot.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hall-select">Select Hall</Label>
                  <select
                    id="hall-select"
                    className="w-full border border-border rounded-lg px-3 py-2"
                    value={selectedHall}
                    onChange={(e) => setSelectedHall(e.target.value)}
                  >
                    <option value="">-- Select Hall --</option>
                    {halls.map((hall) => (
                      <option key={hall.id} value={hall.id}>
                        {hall.name} ({hall.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={!selectedSlot || !selectedHall || loading}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleDownloadCSV}
                  disabled={!selectedSlot || !selectedHall || loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>

              {halls.length === 0 && (
                <p className="text-sm text-muted text-center py-4">
                  No halls available. Create halls in "Halls & Slots" settings first.
                </p>
              )}

              {slots.length === 0 && halls.length > 0 && (
                <p className="text-sm text-muted text-center py-4">
                  No slots available. Create slots in "Halls & Slots" settings first.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">📋 Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted">
              <p><strong>PDF Format:</strong> Professional formatted document with student details and secret codes</p>
              <p><strong>CSV Format:</strong> Spreadsheet-compatible format for Excel/Google Sheets</p>
              <p><strong>⚠️ Security Note:</strong> Reports contain confidential secret keys. Handle with care.</p>
              <p><strong>Workflow:</strong> Create Slot → Run Allocation → Download Reports</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
