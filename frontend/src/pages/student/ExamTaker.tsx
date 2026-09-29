import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Key } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function ExamTaker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [key, setKey] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!studentId.trim() || !key.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    let testName = "Proctored Exam Session";
    let domain = "Full Stack";
    
    try {
      if (user) {
        const saved = localStorage.getItem(`bookedSlot_${user.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          testName = parsed.testName || testName;
          domain = parsed.domain || domain;
        }
      }
    } catch (e) {
      // ignore
    }

    // Launch exam engine fullscreen
    navigate("/student/exam", { state: { testName, domain } });
  };

  return (
    <div className="mx-auto max-w-md mt-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Enter Exam Session</CardTitle>
          <CardDescription>
            Provide your student ID and the unique key given by your invigilator to start the exam.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input 
                id="studentId" 
                placeholder="e.g. STU12345" 
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examKey">Unique Exam Key</Label>
              <Input 
                id="examKey" 
                type="text" 
                placeholder="Enter the 6+ digit key" 
                value={key}
                onChange={e => setKey(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" size="lg">Launch Exam</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
