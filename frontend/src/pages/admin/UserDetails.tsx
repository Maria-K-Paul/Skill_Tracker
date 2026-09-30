import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";

const MOCK_STUDENTS = [
  { id: "STU001", name: "Alice Johnson", roll: "22CS101", dept: "CSE", semester: "4", domain: "Full Stack", attempts: 4, certs: 2, status: "Active" },
  { id: "STU002", name: "Bob Smith", roll: "22CS102", dept: "CSE", semester: "4", domain: "Cybersecurity", attempts: 2, certs: 1, status: "At risk" },
  { id: "STU003", name: "Charlie Davis", roll: "21CS088", dept: "CSE", semester: "6", domain: "Cloud & DevOps", attempts: 4, certs: 2, status: "Active" },
  { id: "STU004", name: "Diana Prince", roll: "22IT056", dept: "IT", semester: "4", domain: "Full Stack", attempts: 3, certs: 0, status: "Removed" },
  { id: "STU005", name: "Eve Adams", roll: "23EC011", dept: "ECE", semester: "2", domain: "Full Stack", attempts: 5, certs: 5, status: "Completed" },
];

const MOCK_STAFF = [
  { id: "U001", name: "Admin User", role: "admin", email: "admin@example.com", domain: "-" },
  { id: "U002", name: "Invigilator 1", role: "invigilator", email: "invigilator@example.com", domain: "-" },
  { id: "U003", name: "Track Owner FS", role: "track_owner", domain: "Full Stack", email: "track@example.com" },
];

export function UserDetails() {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [semFilter, setSemFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const filteredStudents = MOCK_STUDENTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = domainFilter === "all" || s.domain === domainFilter;
    const matchesDept = deptFilter === "all" || s.dept === deptFilter;
    const matchesSem = semFilter === "all" || s.semester === semFilter;
    return matchesSearch && matchesDomain && matchesDept && matchesSem;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Active": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">{status}</Badge>;
      case "At risk": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">{status}</Badge>;
      case "Removed": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">{status}</Badge>;
      case "Completed": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">{status}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader 
        title="Details Directory" 
        description="Comprehensive list of all students and staff members."
      />

      <Card>
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Students</h2>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="All departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                <SelectItem value="CSE">CSE</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="ECE">ECE</SelectItem>
              </SelectContent>
            </Select>

            <Select value={semFilter} onValueChange={setSemFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="All semesters" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All semesters</SelectItem>
                <SelectItem value="2">Sem 2</SelectItem>
                <SelectItem value="4">Sem 4</SelectItem>
                <SelectItem value="6">Sem 6</SelectItem>
                <SelectItem value="8">Sem 8</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="All domains" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All domains</SelectItem>
                <SelectItem value="Full Stack">Full Stack</SelectItem>
                <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                <SelectItem value="Cloud & DevOps">Cloud & DevOps</SelectItem>
                <SelectItem value="AI / ML">AI / ML</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              type="search" 
              placeholder="Search name / reg no" 
              className="w-[180px] h-8 text-xs" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reg no</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Certs</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map(student => (
                <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser(student)}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.roll}</TableCell>
                  <TableCell>{student.dept}</TableCell>
                  <TableCell>{student.semester}</TableCell>
                  <TableCell>{student.domain}</TableCell>
                  <TableCell>{student.attempts}</TableCell>
                  <TableCell>{student.certs}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No students found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Staff Accounts</h2>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_STAFF.map(staff => (
                <TableRow key={staff.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser(staff)}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell className="text-muted-foreground">{staff.id}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{staff.role.replace("_", " ")}</Badge></TableCell>
                  <TableCell>{staff.domain}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Profile information for {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                {selectedUser.roll ? (
                  <>
                    <div><span className="text-xs text-muted-foreground block uppercase font-semibold">Roll Number</span><span>{selectedUser.roll}</span></div>
                    <div><span className="text-xs text-muted-foreground block uppercase font-semibold">Department</span><span>{selectedUser.dept}</span></div>
                    <div><span className="text-xs text-muted-foreground block uppercase font-semibold">Semester</span><span>Sem {selectedUser.semester}</span></div>
                    <div><span className="text-xs text-muted-foreground block uppercase font-semibold">Current Domain</span><span>{selectedUser.domain}</span></div>
                  </>
                ) : (
                  <>
                    <div><span className="text-xs text-muted-foreground block uppercase font-semibold">User ID</span><span>{selectedUser.id}</span></div>
                    <div><span className="text-xs text-muted-foreground block uppercase font-semibold">Email</span><span>{selectedUser.email}</span></div>
                    <div><span className="text-xs text-muted-foreground block uppercase font-semibold">Role</span><span className="capitalize">{selectedUser.role.replace("_", " ")}</span></div>
                    <div><span className="text-xs text-muted-foreground block uppercase font-semibold">Domain</span><span>{selectedUser.domain}</span></div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
