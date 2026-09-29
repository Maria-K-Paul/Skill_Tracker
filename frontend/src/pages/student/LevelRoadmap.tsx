import { PageHeader } from "../../components/layout/PageHeader";
import { Check, Lock, Key } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

export function LevelRoadmap() {
  const navigate = useNavigate();
  // Mock roadmap data
  const levels = [
    { id: 1, title: "Level 1: Fundamentals", status: "completed", attemptsLeft: 3 },
    { id: 2, title: "Level 2: Intermediate", status: "unlocked", attemptsLeft: 2 },
    { id: 3, title: "Level 3: Advanced", status: "locked", attemptsLeft: 3 },
    { id: 4, title: "Level 4: Expert", status: "locked", attemptsLeft: 3 },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader 
        title="Level Roadmap" 
        description="Your progression path in Full Stack Development."
      />

      <div className="relative mt-12 space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {levels.map((level, idx) => (
          <div key={level.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10",
              level.status === 'completed' ? "border-primary bg-primary text-primary-foreground" :
              level.status === 'unlocked' ? "border-primary text-primary" : "border-muted text-muted-foreground bg-muted"
            )}>
              {level.status === 'completed' && <Check className="h-5 w-5" />}
              {level.status === 'unlocked' && <span className="font-bold">{level.id}</span>}
              {level.status === 'locked' && <Lock className="h-5 w-5" />}
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className={cn("text-lg font-bold", level.status === 'locked' && "text-muted-foreground")}>
                  {level.title}
                </h3>
                {level.status !== 'locked' && (
                  <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                    {[1, 2, 3].map(k => (
                      <Key key={k} className={cn("h-4 w-4", k <= level.attemptsLeft ? "text-amber-500" : "text-muted opacity-50")} />
                    ))}
                  </div>
                )}
              </div>
              
              {level.status === 'unlocked' && (
                <div className="flex space-x-3 mt-4">
                  <Button onClick={() => navigate("/student/prep")}>Prepare</Button>
                  <Button variant="outline" onClick={() => navigate("/student/book-slot")}>Book Exam</Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
