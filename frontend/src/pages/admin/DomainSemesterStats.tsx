import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";

export function DomainSemesterStats() {
  const stats = [
    { domain: "Full Stack", sem3: "85%", sem4: "78%", sem5: "92%", sem6: "88%" },
    { domain: "Cybersecurity", sem3: "90%", sem4: "82%", sem5: "85%", sem6: "89%" },
    { domain: "Cloud & DevOps", sem3: "75%", sem4: "80%", sem5: "88%", sem6: "91%" },
    { domain: "AI / ML", sem3: "88%", sem4: "84%", sem5: "90%", sem6: "95%" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader 
        title="Domain x Semester Stats" 
        description="Average pass rates across cohorts."
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Semester 3</TableHead>
                <TableHead>Semester 4</TableHead>
                <TableHead>Semester 5</TableHead>
                <TableHead>Semester 6</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium"><Badge variant="outline">{s.domain}</Badge></TableCell>
                  <TableCell>{s.sem3}</TableCell>
                  <TableCell>{s.sem4}</TableCell>
                  <TableCell>{s.sem5}</TableCell>
                  <TableCell>{s.sem6}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
