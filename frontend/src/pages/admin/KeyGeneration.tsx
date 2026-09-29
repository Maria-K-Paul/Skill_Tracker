import { useState, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Key, AlertCircle } from "lucide-react";

const DOMAINS = ["Full Stack", "Cybersecurity", "Cloud & DevOps", "AI / ML"];
const LEVELS = ["Entrance Test", "Level 1", "Level 2", "Level 3"];

// Mock students taking a particular domain & level
const generateMockStudents = (domain: string, level: string) => {
  return [
    { id: "STU001", name: "Alice Johnson", semester: 4, roll: "22CS101", domain, level },
    { id: "STU002", name: "Bob Smith", semester: 4, roll: "22CS102", domain, level },
    { id: "STU003", name: "Charlie Davis", semester: 6, roll: "21CS088", domain, level },
    { id: "STU004", name: "Diana Prince", semester: 4, roll: "22IT056", domain, level },
    { id: "STU005", name: "Eve Adams", semester: 2, roll: "23EC011", domain, level },
  ];
};

export function KeyGeneration() {
  const [domain, setDomain] = useState("");
  const [level, setLevel] = useState("");
  const [slot, setSlot] = useState("");
  
  const [slots, setSlots] = useState<any[]>([]);
  const [generatedList, setGeneratedList] = useState<any[]>([]);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const savedSlots = localStorage.getItem("mockGlobalSlots");
    if (savedSlots) {
      setSlots(JSON.parse(savedSlots));
    } else {
      // fallback if settings hasn't been saved yet
      setSlots([
        { id: "S1", date: "Oct 15, 2026", time: "10:00 AM", venue: "Lab 4, CS Block" },
        { id: "S2", date: "Oct 15, 2026", time: "02:00 PM", venue: "Lab 2, IT Block" }
      ]);
    }
  }, []);

  const handleGenerate = () => {
    if (!domain || !level || !slot) return;

    const combinationKey = `KEYS-${domain}-${level}-${slot}`;
    const existingStr = localStorage.getItem("mockExamKeysBulk");
    const existing = existingStr ? JSON.parse(existingStr) : {};

    if (existing[combinationKey]) {
      setAlreadyExists(true);
      setGeneratedList(existing[combinationKey]);
      setShowResult(true);
    } else {
      setAlreadyExists(false);
      const mockStudents = generateMockStudents(domain, level);
      const newKeysList = mockStudents.map(student => ({
        student,
        keyA: Math.random().toString(36).substring(2, 10).toUpperCase(),
        keyB: Math.random().toString(36).substring(2, 14).toUpperCase(),
      }));
      
      existing[combinationKey] = newKeysList;
      localStorage.setItem("mockExamKeysBulk", JSON.stringify(existing));
      
      setGeneratedList(newKeysList);
      setShowResult(true);
    }
  };

  const maskKey = (key: string) => {
    if (!key) return "";
    return `••••-••••-${key.substring(key.length - 4)}`;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader 
        title="Exam Key Generation" 
        description="Generate unique cryptographic Key A and Key B pairs for all students in a domain/level test."
      />

      <Card>
        <CardHeader>
          <CardTitle>Select Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                <SelectContent>
                  {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel} disabled={!domain}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Slot</Label>
              <Select value={slot} onValueChange={setSlot} disabled={!level}>
                <SelectTrigger><SelectValue placeholder="Select slot" /></SelectTrigger>
                <SelectContent>
                  {slots.map(s => <SelectItem key={s.id} value={s.id}>{s.date} - {s.time}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleGenerate}
              disabled={!domain || !level || !slot}
            >
              <Key className="mr-2 h-4 w-4" /> Generate Keys
            </Button>
          </div>
        </CardContent>
      </Card>

      {showResult && (
        <div className="space-y-4">
          {alreadyExists && (
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200 text-amber-800 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold">Keys already generated</h4>
                <p className="text-sm mt-1">A key batch was previously generated for this Domain, Level, and Slot combination. Showing existing keys.</p>
              </div>
            </div>
          )}
          
          <Card className="border-2 border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-lg text-xs font-semibold">
              CONFIDENTIAL DATA
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Generated Keys Batch</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Sem</TableHead>
                    <TableHead>Key A (Invigilator Facing)</TableHead>
                    <TableHead>Key B (System Encrypted)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedList.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.student.roll}</TableCell>
                      <TableCell>{item.student.name}</TableCell>
                      <TableCell>{item.student.semester}</TableCell>
                      <TableCell className="font-mono font-bold tracking-wider">{item.keyA}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{maskKey(item.keyB)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
