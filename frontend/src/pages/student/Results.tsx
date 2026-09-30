import { useState, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useAuth } from "../../hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";

type TestResult = {
  id: string;
  name: string;
  domain: string;
  level: string;
  date: string;
  passed: boolean;
  score: number;
  total: number;
  correct: number;
  wrong: number;
  unattempted: number;
  viewed: boolean;
  questions: {
    q: string;
    options: string[];
    studentAnswer: string;
    correctAnswer: string;
    status: "correct" | "wrong" | "unattempted";
  }[];
};

export function Results() {
  const navigate = useNavigate();
  const { user, updateDomain } = useAuth();
  
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  useEffect(() => {
    if (user) {
      const existingStr = localStorage.getItem(`mockResults_${user.id}`);
      if (existingStr) {
        try {
        const stored = JSON.parse(existingStr);
        // Only show level exams if user has unlocked a domain, otherwise just entrance exams
        const filtered = Array.isArray(stored)
          ? (user?.domain ? stored : stored.filter((r: any) => r.level === "Entrance"))
          : [];
        setResults(filtered);
      } catch (e) {
        // ignore
      }
    }
    }
  }, [user]);

  const viewResult = (test: TestResult) => {
    setSelectedTest(test);
    
    // First-time reveal logic
    if (!test.viewed) {
      if (test.passed) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // If it's an entrance test, assign the domain to the mock user
        if (test.level === "Entrance" && updateDomain) {
          updateDomain(test.domain);
        }
      }
      
      // Update viewed status locally and in localStorage
      setResults(prev => {
        const updated = prev.map(r => r.id === test.id ? { ...r, viewed: true } : r);
        if (user) {
          localStorage.setItem(`mockResults_${user.id}`, JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  if (selectedTest) {
    const isFirstTime = !results.find(r => r.id === selectedTest.id)?.viewed;
    return (
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={() => setSelectedTest(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
          </Button>
          {selectedTest.passed && selectedTest.level === "Entrance" && (
             <Button variant="default" onClick={() => navigate("/student/dashboard")}>
               Proceed to Domain Dashboard
             </Button>
          )}
        </div>
        
        {isFirstTime && selectedTest.passed && (
          <div className="mb-6 rounded-lg bg-green-500/15 border border-green-500/30 p-6 text-center animate-in slide-in-from-top-4 fade-in">
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Congratulations!</h2>
            <p className="text-green-600 dark:text-green-300">You have successfully cleared the {selectedTest.name}.</p>
          </div>
        )}

        {isFirstTime && !selectedTest.passed && (
          <div className="mb-6 rounded-lg bg-destructive/15 border border-destructive/30 p-6 text-center animate-in slide-in-from-top-4 fade-in">
            <h2 className="text-2xl font-bold text-destructive mb-2">Sorry, you did not pass</h2>
            <p className="text-muted-foreground mb-4">You did not meet the required score for the {selectedTest.name}.</p>
            <Button variant="outline" onClick={() => navigate("/student/prep")}>Go to Test Prep</Button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="md:col-span-1 bg-card">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full">
              {selectedTest.passed ? (
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive mb-4" />
              )}
              <h3 className="text-xl font-bold mb-1">{selectedTest.passed ? "PASSED" : "FAILED"}</h3>
              <div className="mt-4 text-4xl font-black text-primary">
                {selectedTest.score} / {selectedTest.total}
              </div>
              <p className="text-muted-foreground mt-2">{Math.round((selectedTest.score / selectedTest.total) * 100)}% Score</p>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedTest.correct}</div>
                  <div className="text-sm font-medium text-green-800 dark:text-green-300 mt-1">Correct</div>
                </div>
                <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">{selectedTest.wrong}</div>
                  <div className="text-sm font-medium text-red-800 dark:text-red-300 mt-1">Wrong</div>
                </div>
                <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{selectedTest.unattempted}</div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-300 mt-1">Unattempted</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-xl font-bold mb-4">Question Breakdown</h3>
        <div className="space-y-6">
          {selectedTest.questions.map((q, idx) => (
            <Card key={idx} className={
              q.status === 'correct' ? 'border-green-200 dark:border-green-900/50' : 
              q.status === 'wrong' ? 'border-red-200 dark:border-red-900/50' : ''
            }>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">Question {idx + 1}</CardTitle>
                  <Badge variant={
                    q.status === 'correct' ? 'default' : 
                    q.status === 'wrong' ? 'destructive' : 'secondary'
                  } className={q.status === 'correct' ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {q.status.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription className="text-base text-foreground mt-2">{q.q}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const isStudentAns = q.studentAnswer === opt;
                    const isCorrectAns = q.correctAnswer === opt;
                    
                    let bgClass = "bg-background";
                    let borderClass = "border-input";
                    let textClass = "";
                    
                    if (isCorrectAns) {
                      bgClass = "bg-green-100 dark:bg-green-900/30";
                      borderClass = "border-green-500";
                      textClass = "text-green-800 dark:text-green-200 font-medium";
                    } else if (isStudentAns && !isCorrectAns) {
                      bgClass = "bg-red-100 dark:bg-red-900/30";
                      borderClass = "border-red-500";
                      textClass = "text-red-800 dark:text-red-200";
                    }

                    return (
                      <div key={i} className={`flex items-center justify-between p-3 rounded border ${bgClass} ${borderClass} ${textClass}`}>
                        <span>{opt}</span>
                        <div className="flex space-x-2">
                          {isStudentAns && <span className="text-xs font-bold uppercase tracking-wider opacity-70">Your Answer</span>}
                          {isCorrectAns && <span className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Correct Answer</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader 
        title="Test Results" 
        description="View your performance across all attempted entrance and level tests."
      />
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Date Taken</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {r.name}
                  {!r.viewed && <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">NEW</Badge>}
                </TableCell>
                <TableCell>{r.domain}</TableCell>
                <TableCell>{r.level}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => viewResult(r)}>
                    <Eye className="mr-2 h-4 w-4" /> View Result
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No tests taken yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
