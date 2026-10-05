import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useAuth } from "../../hooks/useAuth";

const MOCK_DOMAIN_STUDENTS = [
  { id: 1, name: "Alice Smith", roll: "21CS001", dept: "CSE", sem: "3", level: "Level 2", attempts: 1, maxAttempts: 3 },
  { id: 2, name: "Bob Jones", roll: "21CS042", dept: "CSE", sem: "3", level: "Level 1", attempts: 3, maxAttempts: 3 },
  { id: 3, name: "Charlie Davis", roll: "22IT011", dept: "IT", sem: "4", level: "Level 3", attempts: 2, maxAttempts: 3 },
  { id: 4, name: "Diana Prince", roll: "21EC088", dept: "ECE", sem: "5", level: "Level 1", attempts: 3, maxAttempts: 3 },
  { id: 5, name: "Evan Wright", roll: "23CS012", dept: "CSE", sem: "2", level: "Level 1", attempts: 0, maxAttempts: 3 },
];

export function EnrolledStudents() {
  const { user } = useAuth();
  const domain = user?.domain || "Unknown Domain";
  
  const [deptFilter, setDeptFilter] = useState("all");
  const [semFilter, setSemFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const filteredStudents = MOCK_DOMAIN_STUDENTS.filter(s => {
    const matchDept = deptFilter === "all" || s.dept === deptFilter;
    const matchSem = semFilter === "all" || s.sem === semFilter;
    const matchLevel = levelFilter === "all" || s.level === levelFilter;
    return matchDept && matchSem && matchLevel;
  });

  const getStatus = (student: any) => {
    if (student.attempts === student.maxAttempts) {
      // In a real app, we'd check if they passed. Mocking: Bob Jones failed, Diana passed
      if (student.name === "Diana Prince") return <Badge className="bg-success/20 text-success">Passed</Badge>;
      return <Badge className="bg-destructive/20 text-destructive">Blocked</Badge>;
    }
    if (student.attempts === 0) return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
    return <Badge className="bg-warning/20 text-warning">Yet to pass</Badge>;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader 
        title="Enrolled Students" 
        description={`${domain} Domain`}
      />

      <Card>
        <div className="p-4 border-b flex flex-wrap gap-4 items-center">
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="ECE">ECE</SelectItem>
            </SelectContent>
          </Select>

          <Select value={semFilter} onValueChange={setSemFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Semester" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              <SelectItem value="2">Sem 2</SelectItem>
              <SelectItem value="3">Sem 3</SelectItem>
              <SelectItem value="4">Sem 4</SelectItem>
              <SelectItem value="5">Sem 5</SelectItem>
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Level 1">Level 1</SelectItem>
              <SelectItem value="Level 2">Level 2</SelectItem>
              <SelectItem value="Level 3">Level 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Current Level</TableHead>
                <TableHead>Attempts Used</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.roll}</TableCell>
                  <TableCell>{s.dept}</TableCell>
                  <TableCell>Sem {s.sem}</TableCell>
                  <TableCell><Badge variant="outline">{s.level}</Badge></TableCell>
                  <TableCell>{s.attempts} / {s.maxAttempts}</TableCell>
                  <TableCell>{getStatus(s)}</TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No students matched.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
