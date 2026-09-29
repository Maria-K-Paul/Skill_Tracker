import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Loader2, BrainCircuit } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuestionGeneratorPrompt() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock processing delay
    setTimeout(() => {
      navigate("/track-owner/review");
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader 
        title="AI Question Generator" 
        description="Generate a new batch of questions for Level 2."
      />

      <Card>
        <CardHeader>
          <CardTitle>Generation Parameters</CardTitle>
          <CardDescription>Provide context for the AI to generate relevant, high-quality questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-3">
              <Label>Exam Type</Label>
              <RadioGroup defaultValue="main" className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="main" id="r1" />
                  <Label htmlFor="r1">Main Exam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mock" id="r2" />
                  <Label htmlFor="r2">Mock Test</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="topic">Specific Topic / Prompt (Optional)</Label>
              <Input id="topic" placeholder="e.g. React Component Lifecycle, Hooks, useEffect..." />
            </div>

            <div className="space-y-3">
              <Label htmlFor="count">Number of Questions to Generate</Label>
              <Input id="count" type="number" defaultValue="20" min="5" max="50" />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating via AI...</>
              ) : (
                <><BrainCircuit className="mr-2 h-4 w-4" /> Generate Questions</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
