import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export function ActiveExamsMonitor() {
  const students = [
    { id: 1, name: "Alice Smith", roll: "21CS001", status: "In Progress", violations: 0, timeLeft: "45:20" },
    { id: 2, name: "Bob Jones", roll: "21CS042", status: "Warning", violations: 1, timeLeft: "43:10" },
    { id: 3, name: "Charlie Brown", roll: "21CS088", status: "Auto-Submitted", violations: 2, timeLeft: "00:00" },
    { id: 4, name: "Diana Prince", roll: "21CS105", status: "Completed", violations: 0, timeLeft: "00:00" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader 
        title="Live Exam Monitor" 
        description="CSE Lab 1 • 45/50 Seats Filled"
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Time Left</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Violations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id} className={s.status === "Warning" ? "bg-amber-50" : s.status === "Auto-Submitted" ? "bg-destructive/10" : ""}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.roll}</TableCell>
                  <TableCell className="font-mono">{s.timeLeft}</TableCell>
                  <TableCell>
                    {s.status === "In Progress" && <Badge className="bg-blue-500">In Progress</Badge>}
                    {s.status === "Completed" && <Badge className="bg-green-500">Completed</Badge>}
                    {s.status === "Warning" && <Badge variant="destructive" className="bg-amber-500 text-white">Warning</Badge>}
                    {s.status === "Auto-Submitted" && <Badge variant="destructive">Terminated</Badge>}
                  </TableCell>
                  <TableCell>
                    {s.violations === 0 ? (
                      <div className="flex items-center text-green-600"><CheckCircle2 className="mr-1 h-4 w-4" /> 0</div>
                    ) : (
                      <div className="flex items-center text-destructive font-bold"><ShieldAlert className="mr-1 h-4 w-4" /> {s.violations}</div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
