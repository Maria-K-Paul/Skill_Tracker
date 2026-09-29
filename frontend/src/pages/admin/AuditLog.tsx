import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

export function AuditLog() {
  const logs = [
    { id: 1, action: "User Login", user: "smith@college.edu", time: "2024-10-14 08:30:12" },
    { id: 2, action: "Generated Questions", user: "track@college.edu", time: "2024-10-14 09:15:00" },
    { id: 3, action: "System Config Updated", user: "admin@college.edu", time: "2024-10-14 10:05:45" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="System Audit Log" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground">{log.time}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
