import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

export function StudentDirectory() {
  const students = [
    { id: 1, name: "Alice Smith", roll: "21CS001", sem: 3, domain: "Full Stack", level: 2 },
    { id: 2, name: "Bob Jones", roll: "21CS042", sem: 3, domain: "AI / ML", level: 1 },
    { id: 3, name: "Charlie Brown", roll: "21CS088", sem: 5, domain: "Cybersecurity", level: 3 },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader 
        title="Student Directory" 
        description="Institution-wide view of all students and their progression."
      />

      <Card className="mb-6">
        <CardContent className="p-4 flex gap-4">
          <Input placeholder="Search by name or roll number..." className="max-w-sm" />
          {/* Add select filters here if needed */}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Current Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.roll}</TableCell>
                  <TableCell>Sem {s.sem}</TableCell>
                  <TableCell><Badge variant="outline">{s.domain}</Badge></TableCell>
                  <TableCell>Level {s.level}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
