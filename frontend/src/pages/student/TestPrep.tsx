import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CheckCircle2, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TestPrep() {
  const navigate = useNavigate();

  const topics = [
    "React Component Lifecycle & Hooks",
    "State Management with Redux/Zustand",
    "RESTful API Integration",
    "Advanced TypeScript Generics"
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader 
        title="Preparation: Level 2" 
        description="AI-curated topics based on your previous performance and upcoming level requirements."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Focus Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {topics.map((t, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Based on your Level 1 results, you should focus heavily on React Hooks and useEffect dependencies. 
                Your score in state management was solid, but API integration using async/await within useEffect 
                showed room for improvement.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Ready for the Exam?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm opacity-90">
                Ensure you are well-prepared before taking the actual exam.
              </p>
              <Button variant="secondary" className="w-full" onClick={() => navigate("/student/book-slot")}>
                <Calendar className="mr-2 h-4 w-4" />
                Book a slot
              </Button>
              <Button variant="outline" className="w-full bg-transparent text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10" onClick={() => navigate("/student/upcoming-test")}>
                <Eye className="mr-2 h-4 w-4" />
                Go to Upcoming Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
