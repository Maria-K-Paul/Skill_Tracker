import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function ActiveExamsMonitor() {
  const [students, setStudents] = useState([
    { id: 1, name: "Alice Smith", roll: "21CS001", status: "In Progress", violations: 0, timeLeft: "45:20" },
    { id: 2, name: "Bob Jones", roll: "21CS042", status: "Warning", violations: 1, timeLeft: "43:10" },
    { id: 3, name: "Charlie Brown", roll: "21CS088", status: "Auto-Submitted", violations: 2, timeLeft: "00:00" },
    { id: 4, name: "Diana Prince", roll: "21CS105", status: "Completed", violations: 0, timeLeft: "00:00" },
  ]);

  // Sort function to keep live/active at top
  const sortedStudents = [...students].sort((a, b) => {
    const priority = { "Warning": 1, "In Progress": 2, "Completed": 3, "Auto-Submitted": 4 };
    return priority[a.status as keyof typeof priority] - priority[b.status as keyof typeof priority];
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader 
        title="Live Exam Monitor" 
        description="CSE Lab 1 • 45/50 Seats Filled"
      />

      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Roll Number</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time Left</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Violations</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                <AnimatePresence>
                  {sortedStudents.map((s) => (
                    <motion.tr 
                      key={s.id} 
                      layout
                      initial={{ opacity: 0, backgroundColor: "hsl(var(--primary) / 0.2)" }}
                      animate={{ 
                        opacity: 1, 
                        backgroundColor: s.status === "Warning" ? "hsl(var(--warning) / 0.1)" : 
                                         s.status === "Auto-Submitted" ? "hsl(var(--destructive) / 0.1)" : 
                                         "transparent"
                      }}
                      transition={{ duration: 0.5 }}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle font-medium">
                        <div className="flex items-center gap-2">
                          {s.status === "In Progress" || s.status === "Warning" ? (
                            <motion.div 
                              className={s.status === "Warning" ? "w-2 h-2 rounded-full bg-warning/100" : "w-2 h-2 rounded-full bg-info/100"}
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-transparent" />
                          )}
                          {s.name}
                        </div>
                      </td>
                      <td className="p-4 align-middle">{s.roll}</td>
                      <td className="p-4 align-middle font-mono">{s.timeLeft}</td>
                      <td className="p-4 align-middle">
                        {s.status === "In Progress" && <Badge className="bg-info/100 hover:bg-info">In Progress</Badge>}
                        {s.status === "Completed" && <Badge className="bg-success/100 hover:bg-success">Completed</Badge>}
                        {s.status === "Warning" && <Badge variant="destructive" className="bg-warning/100 hover:bg-warning text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]">Warning</Badge>}
                        {s.status === "Auto-Submitted" && <Badge variant="destructive">Terminated</Badge>}
                      </td>
                      <td className="p-4 align-middle">
                        {s.violations === 0 ? (
                          <div className="flex items-center text-success"><CheckCircle2 className="mr-1 h-4 w-4" /> 0</div>
                        ) : (
                          <div className="flex items-center text-destructive font-bold"><ShieldAlert className="mr-1 h-4 w-4" /> {s.violations}</div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
