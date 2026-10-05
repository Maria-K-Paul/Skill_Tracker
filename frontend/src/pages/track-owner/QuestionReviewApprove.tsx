import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Check, X, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuestionReviewApprove() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
    { id: 1, q: "What is the virtual DOM?", options: ["A direct copy of the DOM", "A lightweight Javascript representation of the DOM", "A CSS engine", "A backend database"], correct: 1, status: "pending" },
    { id: 2, q: "Which hook is used for state?", options: ["useEffect", "useState", "useContext", "useReducer"], correct: 1, status: "pending" },
  ]);

  const updateStatus = (id: number, status: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, status } : q));
  };

  const publish = () => {
    navigate("/track-owner/levels");
  };

  const allReviewed = questions.every(q => q.status !== "pending");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader 
        title="Review Generated Questions" 
        description="Review, edit, and approve the AI-generated questions before adding them to the bank."
        action={<Button disabled={!allReviewed} onClick={publish}>Publish to Bank</Button>}
      />

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id} className={q.status === 'approved' ? 'border-success bg-success/10' : q.status === 'rejected' ? 'border-destructive bg-destructive/10' : ''}>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-bold">Q{idx + 1}</span>
                  {q.status === 'pending' && <Badge variant="secondary">Pending Review</Badge>}
                  {q.status === 'approved' && <Badge className="bg-success/100">Approved</Badge>}
                  {q.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                </div>
                <h3 className="text-lg font-medium mb-4">{q.q}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {q.options.map((opt, i) => (
                    <li key={i} className={`flex items-center ${i === q.correct ? 'text-primary font-bold' : ''}`}>
                      <span className="w-6">{String.fromCharCode(65 + i)}.</span> {opt} {i === q.correct && "✓"}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-row md:flex-col justify-end space-x-2 md:space-x-0 md:space-y-2">
                <Button size="sm" variant="outline"><Edit3 className="h-4 w-4" /></Button>
                <Button size="sm" variant="default" className="bg-success hover:bg-success" onClick={() => updateStatus(q.id, 'approved')}><Check className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatus(q.id, 'rejected')}><X className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
