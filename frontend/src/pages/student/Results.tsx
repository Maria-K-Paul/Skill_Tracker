import { useState, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, Eye, Star, Sparkles, Circle } from "lucide-react";
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
import { FallingLetters } from "../../components/ui/falling-letters";
import { GradientBands } from "../../components/ui/gradient-bands";
import { FlipCard } from "../../components/ui/flip-card";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { ANIMATION_CONFIG, pageTransitionVariants } from "../../lib/animations";

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

function AnimatedScore({ score, delay }: { score: number, delay: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(0, score, { 
      duration: 1, 
      delay, 
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (val) => count.set(val)
    });
    return controls.stop;
  }, [score, delay, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function Results() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [lettersFinished, setLettersFinished] = useState(false);

  useEffect(() => {
    if (user) {
      const existingStr = localStorage.getItem(`mockResults_${user.id}`);
      if (existingStr) {
        try {
          const stored = JSON.parse(existingStr);
          const filtered = Array.isArray(stored)
            ? (user?.domain ? stored : stored.filter((r: any) => r.level === "Entrance"))
            : [];
          setResults(filtered);
        } catch (e) {}
      }
    }
  }, [user]);

  const viewResult = (test: TestResult) => {
    setSelectedTest(test);
    setLettersFinished(false);
    
    if (!test.viewed) {
      setResults(prev => {
        const updated = prev.map(r => r.id === test.id ? { ...r, viewed: true } : r);
        if (user) localStorage.setItem(`mockResults_${user.id}`, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleLettersComplete = () => {
    setLettersFinished(true);
    if (selectedTest?.passed) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'] // success, warning, info, primary approx
      });
    }
  };

  if (selectedTest) {
    const isFirstTime = !results.find(r => r.id === selectedTest.id)?.viewed;
    const isPass = selectedTest.passed;
    
    return (
      <motion.div 
        key={selectedTest.id}
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="mx-auto max-w-5xl"
      >
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={() => setSelectedTest(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
          </Button>
          {isPass && selectedTest.level === "Entrance" && (
             <Button variant="default" onClick={() => navigate("/student/dashboard")}>
               Proceed to Domain Dashboard
             </Button>
          )}
        </div>
        
        {isFirstTime && isPass && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg bg-success/100/15 border border-success/30 p-6 text-center"
          >
            <h2 className="text-2xl font-bold text-success dark:text-success mb-2">Congratulations!</h2>
            <p className="text-success dark:text-success">You have successfully cleared the {selectedTest.name}.</p>
          </motion.div>
        )}

        {isFirstTime && !isPass && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg bg-destructive/15 border border-destructive/30 p-6 text-center"
          >
            <h2 className="text-2xl font-bold text-destructive mb-2">Sorry, you did not pass</h2>
            <p className="text-muted-foreground mb-4">You did not meet the required score for the {selectedTest.name}.</p>
            <Button variant="outline" onClick={() => navigate("/student/prep")}>Go to Test Prep</Button>
          </motion.div>
        )}

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="md:col-span-1 bg-card overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full relative">
              
              {/* Accessible Header but visually hidden */}
              <h3 className="sr-only">{isPass ? "PASSED" : "FAILED"}</h3>
              
              <FlipCard
                trigger="click"
                axis="y"
                className="w-full h-[300px]"
                onFlip={(isFlipped) => {
                  if (isFlipped) {
                    setTimeout(() => {
                      if (isPass) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                      setLettersFinished(true);
                    }, 500); // slight delay after flip
                  }
                }}
                front={
                  <div className="w-full h-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer flex flex-col items-center justify-center p-8">
                    <span className="text-2xl font-bold tracking-tight text-primary animate-pulse">Tap to reveal</span>
                    <span className="text-muted-foreground mt-2">your results</span>
                  </div>
                }
                back={
                  <div className="w-full h-full rounded-xl border bg-card flex flex-col relative overflow-hidden">
                    <div className="relative w-full overflow-hidden h-[180px] flex items-center justify-center shrink-0 border-b border-border/50 bg-muted/10">
                      <GradientBands 
                        bands={isPass ? 7 : 5}
                        palette={isPass ? [
                          "hsl(var(--primary) / 0.1)",
                          "hsl(var(--primary) / 0.3)",
                          "hsl(var(--primary) / 0.6)",
                          "hsl(var(--primary) / 0.3)",
                          "hsl(var(--primary) / 0.1)",
                        ] : [
                          "hsl(220 15% 80%)",
                          "hsl(220 20% 70%)",
                          "hsl(220 15% 80%)",
                        ]}
                        speed={isPass ? 1.5 : 0.8}
                        className="absolute inset-0 z-0"
                        overlayClassName={isPass ? "bg-white/20 dark:bg-black/40" : "bg-white/50 dark:bg-black/50"}
                      />
                      
                      {/* Decorative Icons for Pass State */}
                      {isPass && (
                        <>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: lettersFinished ? 1 : 0 }} transition={{ type: "spring", delay: 0.1 }} className="absolute top-8 left-8 text-warning z-10 drop-shadow-md">
                            <Star className="h-8 w-8" fill="currentColor" />
                          </motion.div>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: lettersFinished ? 1 : 0 }} transition={{ type: "spring", delay: 0.2 }} className="absolute bottom-6 right-12 text-info z-10 drop-shadow-md">
                            <Sparkles className="h-6 w-6" />
                          </motion.div>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: lettersFinished ? 1 : 0 }} transition={{ type: "spring", delay: 0.3 }} className="absolute top-6 right-16 text-success z-10 drop-shadow-md">
                            <Circle className="h-4 w-4" fill="currentColor" />
                          </motion.div>
                        </>
                      )}

                      <div className="z-10 relative flex flex-col items-center justify-center w-full pt-4">
                        {isPass ? (
                          <CheckCircle2 className="h-10 w-10 text-white fill-success mb-1 drop-shadow-sm" />
                        ) : (
                          <XCircle className="h-10 w-10 text-white fill-destructive mb-1 drop-shadow-sm" />
                        )}
                        
                        <div className="h-[80px] flex items-center justify-center">
                          <FallingLetters 
                            text={isPass ? "PASSED" : "FAILED"} 
                            variant={isPass ? "pass" : "fail"}
                            onComplete={() => {}}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center bg-card p-4">
                      <div className="text-4xl font-black text-primary">
                        <AnimatedScore score={selectedTest.score} delay={0.2} /> / {selectedTest.total}
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm font-medium">
                        <AnimatedScore score={Math.round((selectedTest.score / selectedTest.total) * 100)} delay={0.4} />% Score
                      </p>
                    </div>
                  </div>
                }
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: lettersFinished ? 1 : 0, y: lettersFinished ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.1, ease: ANIMATION_CONFIG.transition.ease }}
                className="grid grid-cols-3 gap-4 text-center"
              >
                <div className="rounded-lg border p-4 bg-success/10 dark:bg-success/20 border-success/30 dark:border-success">
                  <div className="text-3xl font-bold text-success dark:text-success">
                    <AnimatedScore score={selectedTest.correct} delay={0.5} />
                  </div>
                  <div className="text-sm font-medium text-success dark:text-success mt-1">Correct</div>
                </div>
                <div className="rounded-lg border p-4 bg-destructive/10 dark:bg-destructive/20 border-destructive/30 dark:border-destructive">
                  <div className="text-3xl font-bold text-destructive dark:text-destructive">
                    <AnimatedScore score={selectedTest.wrong} delay={0.6} />
                  </div>
                  <div className="text-sm font-medium text-destructive dark:text-destructive mt-1">Wrong</div>
                </div>
                <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    <AnimatedScore score={selectedTest.unattempted} delay={0.7} />
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-300 mt-1">Unattempted</div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: lettersFinished ? 1 : 0, y: lettersFinished ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2, ease: ANIMATION_CONFIG.transition.ease }}
        >
          <h3 className="text-xl font-bold mb-4">Question Breakdown</h3>
          <div className="space-y-6">
            {selectedTest.questions.map((q, idx) => (
              <Card key={idx} className={
                q.status === 'correct' ? 'border-success/30 dark:border-success/50' : 
                q.status === 'wrong' ? 'border-destructive/30 dark:border-destructive/50' : ''
              }>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">Question {idx + 1}</CardTitle>
                    <Badge variant={
                      q.status === 'correct' ? 'default' : 
                      q.status === 'wrong' ? 'destructive' : 'secondary'
                    } className={q.status === 'correct' ? 'bg-success/100 hover:bg-success' : ''}>
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
                        bgClass = "bg-success/20 dark:bg-success/30";
                        borderClass = "border-success";
                        textClass = "text-success dark:text-success font-medium";
                      } else if (isStudentAns && !isCorrectAns) {
                        bgClass = "bg-destructive/20 dark:bg-destructive/30";
                        borderClass = "border-destructive";
                        textClass = "text-destructive dark:text-destructive";
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
        </motion.div>
      </motion.div>
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
                  {!r.viewed && <Badge variant="secondary" className="ml-2 bg-info/20 text-info dark:bg-info/30 dark:text-info">NEW</Badge>}
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
