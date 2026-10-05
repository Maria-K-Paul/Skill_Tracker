import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CheckCircle2, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FlipCard } from "../../components/ui/flip-card";

export function TestPrep() {
  const navigate = useNavigate();

  const flashcards = [
    { topic: "React Component Lifecycle & Hooks", expl: "Hooks allow function components to hook into React state and lifecycle features like useEffect for mounting, updating, and unmounting phases." },
    { topic: "State Management with Redux/Zustand", expl: "Global state solutions for avoiding prop drilling, keeping complex application states predictable and easy to manage." },
    { topic: "RESTful API Integration", expl: "Handling asynchronous requests, managing loading/error states, and properly caching responses using tools like React Query or Fetch API." },
    { topic: "Advanced TypeScript Generics", expl: "Creating reusable types that work over a variety of types rather than a single one, providing maximum flexibility and type safety." }
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
              <CardTitle>Flashcards: Focus Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {flashcards.map((f, i) => (
                  <FlipCard 
                    key={i}
                    trigger="click"
                    axis="x"
                    className="h-32"
                    front={
                      <div className="w-full h-full p-4 rounded-xl border bg-card shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center text-center transition-all">
                        <span className="font-semibold text-sm">{f.topic}</span>
                      </div>
                    }
                    back={
                      <div className="w-full h-full p-4 rounded-xl border-primary bg-primary/10 shadow-sm cursor-pointer flex items-center justify-center text-center">
                        <span className="text-xs font-medium text-foreground">{f.expl}</span>
                      </div>
                    }
                  />
                ))}
              </div>
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
