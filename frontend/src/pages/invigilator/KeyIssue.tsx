import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Key, RotateCw } from "lucide-react";
import { StudentVerification } from "./StudentVerification";

export function KeyIssue() {
  const [rollNumber, setRollNumber] = useState("");
  const [verifiedStudent, setVerifiedStudent] = useState<any>(null);
  const [examKey, setExamKey] = useState<string | null>(null);
  const [ttl, setTtl] = useState(0);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock verification
    if (rollNumber) {
      setVerifiedStudent({
        name: "Alice Smith",
        rollNumber: rollNumber,
        photoUrl: "https://ui-avatars.com/api/?name=Alice+Smith",
        domain: "Full Stack",
        level: "Level 2"
      });
      setExamKey(null);
    }
  };

  const issueKey = () => {
    // Mock key generation
    setExamKey(Math.random().toString(36).substring(2, 10).toUpperCase());
    setTtl(300); // 5 minutes
    
    // Simple TTL countdown
    const interval = setInterval(() => {
      setTtl(t => {
        if (t <= 1) {
          clearInterval(interval);
          setExamKey(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader 
        title="Issue Exam Key" 
        description="Verify student and generate a time-limited exam key for them to start their test."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Student Lookup</CardTitle>
          <CardDescription>Enter the student's roll number to verify their identity and booking.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="roll" className="sr-only">Roll Number</Label>
              <Input 
                id="roll" 
                placeholder="Enter Roll Number..." 
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
              />
            </div>
            <Button type="submit">Lookup</Button>
          </form>
        </CardContent>
      </Card>

      {verifiedStudent && (
        <StudentVerification student={verifiedStudent} />
      )}

      {verifiedStudent && (
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-center">
            {examKey ? (
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">Generated Exam Key</div>
                <div className="text-5xl font-mono font-black tracking-widest text-primary">{examKey}</div>
                <div className="text-sm text-destructive font-medium">Expires in {Math.floor(ttl / 60)}:{(ttl % 60).toString().padStart(2, '0')}</div>
                <Button variant="outline" className="mt-4" onClick={issueKey}>
                  <RotateCw className="mr-2 h-4 w-4" /> Reissue Key
                </Button>
              </div>
            ) : (
              <Button size="lg" onClick={issueKey}>
                <Key className="mr-2 h-5 w-5" /> Generate Exam Key
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
