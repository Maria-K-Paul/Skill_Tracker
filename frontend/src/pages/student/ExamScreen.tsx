import { useState } from "react";
import { ProctoringGuard } from "../../components/exam/ProctoringGuard";
import { ExamTimer } from "../../components/exam/ExamTimer";
import { QuestionNavigator } from "../../components/exam/QuestionNavigator";
import { AutosaveIndicator } from "../../components/exam/AutosaveIndicator";
import { useExamTimer } from "../../hooks/useExamTimer";
import { useAutosave } from "../../hooks/useAutosave";
import { Button } from "../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { Flag, ShieldAlert, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

interface ExamScreenProps {
  isMock?: boolean;
}

export function ExamScreen({ isMock = false }: ExamScreenProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  
  // Set exam end time 1 hour from now
  const endTime = new Date(new Date().getTime() + 60 * 60 * 1000).toISOString();
  
  const mockQuestions = [
    { q: "What is the primary purpose of useEffect in React?", options: ["Routing", "Side effects", "State management", "Styling"], correctAnswer: "Side effects" },
    { q: "Which hook should be used for performance optimization of expensive calculations?", options: ["useMemo", "useEffect", "useState", "useContext"], correctAnswer: "useMemo" },
    { q: "How do you pass data from child to parent in React?", options: ["Props", "Context", "Redux", "Callback functions via props"], correctAnswer: "Callback functions via props" },
    { q: "What is a Higher Order Component?", options: ["A function that returns a component", "A class component", "A hook", "A DOM element"], correctAnswer: "A function that returns a component" }
  ];

  const submitExam = () => {
    setShowSubmitConfirm(false);
    
    // Evaluate answers
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    const evaluatedQuestions = mockQuestions.map((mq, idx) => {
      const studentAns = answers[idx] || "";
      let status: "correct" | "wrong" | "unattempted" = "unattempted";
      if (!studentAns) {
        unattempted++;
      } else if (studentAns === mq.correctAnswer) {
        correct++;
        status = "correct";
      } else {
        wrong++;
        status = "wrong";
      }
      return {
        q: mq.q,
        options: mq.options,
        studentAnswer: studentAns,
        correctAnswer: mq.correctAnswer,
        status
      };
    });

    const testName = location.state?.testName || "Level 2 Main Exam";
    const domain = location.state?.domain || "Full Stack";
    const isEntrance = testName.toLowerCase().includes("entrance");
    
    // For demo purposes, score >= 2 (50%) passes
    const passed = correct >= 2;
    
    const newResult = {
      id: "t" + Date.now(),
      name: testName,
      domain: domain,
      level: isEntrance ? "Entrance" : "Level 2",
      date: new Date().toISOString().split('T')[0],
      passed: passed,
      score: correct,
      total: mockQuestions.length,
      correct,
      wrong,
      unattempted,
      viewed: false,
      questions: evaluatedQuestions
    };

    if (user) {
      const existingStr = localStorage.getItem(`mockResults_${user.id}`);
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(`mockResults_${user.id}`, JSON.stringify([newResult, ...existing]));
      
      // Clear booked slot since it's taken
      localStorage.removeItem(`bookedSlot_${user.id}`);
    }

    navigate("/student/results");
  };

  const { formatted, isCritical } = useExamTimer(endTime, submitExam);
  
  const saveAnswers = async (data: any) => {
    // Mock save delay
    await new Promise(res => setTimeout(res, 500));
    console.log("Autosaved", data);
  };
  const { isSaving, lastSaved } = useAutosave(answers, saveAnswers);

  const handleSelectAnswer = (val: string) => {
    setAnswers(prev => ({ ...prev, [currentQ]: val }));
  };

  const clearResponse = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ];
      return next;
    });
  };

  const markForReview = () => {
    if (!flagged.includes(currentQ)) {
      setFlagged(prev => [...prev, currentQ]);
    }
    if (currentQ < mockQuestions.length - 1) setCurrentQ(q => q + 1);
  };

  const saveAndNext = () => {
    // Ensure we unflag it if they click save and next? Usually save & next clears the review flag if it was just flagged? 
    // Or it leaves it. Let's say it removes the flag since they are confident to "Save".
    if (flagged.includes(currentQ)) {
       setFlagged(prev => prev.filter(x => x !== currentQ));
    }
    if (currentQ < mockQuestions.length - 1) setCurrentQ(q => q + 1);
  };

  const nextQuestion = () => {
    if (currentQ < mockQuestions.length - 1) setCurrentQ(q => q + 1);
  };

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.length;
  const notAttemptedCount = mockQuestions.length - answeredCount;

  return (
    <ProctoringGuard isMock={isMock} onViolationLimit={submitExam}>
      <div className="flex h-screen flex-col bg-background">
        {/* Exam Header */}
        <header className="flex items-center justify-between border-b px-6 py-3 bg-card shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold tracking-tight">
              {location.state?.testName || "Level 2: Intermediate Test"}
            </h1>
            <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
              {location.state?.domain || "Full Stack"}
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <AutosaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
            <ExamTimer formattedTime={formatted} isCritical={isCritical} />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Question Area */}
          <main className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="flex-1 mx-auto max-w-4xl w-full flex flex-col">
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-semibold">Question {currentQ + 1}</h2>
                <div className="flex gap-2">
                  <span className="text-sm font-medium px-2 py-1 bg-muted rounded">Single Choice Type Question</span>
                </div>
              </div>
              
              <div className="mb-8 text-lg leading-relaxed flex-1">
                <p className="mb-6">{mockQuestions[currentQ].q}</p>
                <RadioGroup value={answers[currentQ] || ""} onValueChange={handleSelectAnswer} className="space-y-3">
                  {mockQuestions[currentQ].options.map((opt, i) => (
                    <div key={i} className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${answers[currentQ] === opt ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}>
                      <RadioGroupItem value={opt} id={`q${currentQ}-o${i}`} />
                      <Label htmlFor={`q${currentQ}-o${i}`} className="flex-1 cursor-pointer text-base font-normal">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="border-t pt-4 flex items-center justify-between mx-auto max-w-4xl w-full">
              <div className="flex space-x-3">
                <Button variant="outline" onClick={markForReview}>
                  Mark for Review & Next
                </Button>
                <Button variant="outline" onClick={clearResponse}>
                  Clear Response
                </Button>
              </div>
              <div className="flex space-x-3">
                 <Button variant="secondary" onClick={nextQuestion} disabled={currentQ === mockQuestions.length - 1}>
                   Next
                 </Button>
                 <Button variant="default" onClick={saveAndNext} disabled={currentQ === mockQuestions.length - 1}>
                   Save & Next
                 </Button>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-80 border-l bg-card p-6 flex flex-col">
            <h3 className="mb-4 font-semibold text-lg border-b pb-2">Question Palette</h3>
            <div className="mb-6 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center"><span className="mr-2 inline-block h-4 w-4 rounded-full bg-green-600"></span> Answered</div>
              <div className="flex items-center"><span className="mr-2 inline-block h-4 w-4 rounded-full border border-gray-400"></span> Not Attempted</div>
              <div className="flex items-center"><span className="mr-2 inline-block h-4 w-4 rounded-full bg-purple-600"></span> Marked for Review</div>
              <div className="flex items-center"><span className="mr-2 inline-block h-4 w-4 rounded-full bg-purple-600 border-2 border-green-400"></span> Ans & Marked</div>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4">
              <QuestionNavigator 
                total={mockQuestions.length} 
                current={currentQ} 
                answers={answers}
                flagged={flagged}
                onSelect={setCurrentQ} 
              />
            </div>
            
            <div className="mt-auto pt-4 border-t">
               <Button className="w-full" variant="destructive" onClick={() => setShowSubmitConfirm(true)}>
                 Submit Test
               </Button>
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? You will not be able to change your answers after submission.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <span className="text-2xl font-bold text-green-600">{answeredCount}</span>
              <span className="text-sm font-medium">Answered</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <span className="text-2xl font-bold">{notAttemptedCount}</span>
              <span className="text-sm font-medium">Not Attempted</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <span className="text-2xl font-bold text-purple-600">{flaggedCount}</span>
              <span className="text-sm font-medium">Marked for Review</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>Cancel</Button>
            <Button variant="default" onClick={submitExam}>Confirm Submission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProctoringGuard>
  );
}
