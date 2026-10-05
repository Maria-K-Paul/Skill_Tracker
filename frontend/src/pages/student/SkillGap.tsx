import { useState, useEffect } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { SkillGapRadar } from "../../components/charts/SkillGapRadar";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { FlipCard } from "../../components/ui/flip-card";

const aggregatedData = [
  { subject: 'React Hooks', A: 75, fullMark: 100 },
  { subject: 'State Mgmt', A: 67, fullMark: 100 },
  { subject: 'API Integration', A: 50, fullMark: 100 },
  { subject: 'TypeScript', A: 50, fullMark: 100 },
  { subject: 'Styling', A: 87, fullMark: 100 },
];

export function SkillGap() {
  const { user } = useAuth();
  const [selectedTestId, setSelectedTestId] = useState<string | "all">("all");
  const [pastTests, setPastTests] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const existingStr = localStorage.getItem(`mockResults_${user.id}`);
      if (existingStr) {
        try {
        const stored = JSON.parse(existingStr);
        // Filter based on user domain status: if they haven't unlocked a domain, only show entrance tests
        const filtered = Array.isArray(stored) 
          ? (user?.domain ? stored : stored.filter((r: any) => r.level === "Entrance"))
          : [];
          
        const mappedTests = filtered.map((t: any) => {
          return {
            id: t.id,
            name: t.name,
            level: t.level,
            date: t.date,
            overallScore: Math.round((t.correct / t.total) * 100),
            // Mocking radar data based on score for demo
            radarData: [
              { subject: 'React Hooks', A: Math.max(20, Math.round(Math.random() * 80 + 20)), fullMark: 100 },
              { subject: 'State Mgmt', A: Math.max(20, Math.round(Math.random() * 80 + 20)), fullMark: 100 },
              { subject: 'API Integration', A: Math.max(20, Math.round(Math.random() * 80 + 20)), fullMark: 100 },
              { subject: 'TypeScript', A: Math.max(20, Math.round(Math.random() * 80 + 20)), fullMark: 100 },
              { subject: 'Styling', A: Math.max(20, Math.round(Math.random() * 80 + 20)), fullMark: 100 },
            ],
            weakTopics: t.passed 
              ? [{ name: "Advanced Performance", score: 65, resources: "React Performance Optimization Guide, useMemo Deep Dive" }] 
              : [{ name: "Core Concepts", score: 40, resources: "React Official Docs, Scrimba React Course" }, { name: "Syntax", score: 35, resources: "MDN JS Guide" }]
          };
        });
        
        setPastTests(mappedTests);
      } catch (e) {
        // ignore
      }
    }
    }
  }, [user]);

  const selectedData = selectedTestId === "all" 
    ? aggregatedData 
    : pastTests.find(t => t.id === selectedTestId)?.radarData || aggregatedData;

  const weakTopics = selectedTestId === "all"
    ? [
        { name: "API Integration", score: 50, resources: "React Query documentation, Fetch API MDN" }, 
        { name: "TypeScript", score: 50, resources: "TypeScript Handbook, Matt Pocock tutorials" }
      ]
    : pastTests.find(t => t.id === selectedTestId)?.weakTopics || [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader 
        title="Skill Gap Analysis" 
        description="Track your performance across all past entrance and level tests."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
        {/* Timeline Sidebar */}
        <Card className="md:col-span-1 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-lg">Test History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            <button
              onClick={() => setSelectedTestId("all")}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                selectedTestId === "all" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
              )}
            >
              <div className="font-semibold">Overall Aggregate</div>
              <div className="text-xs opacity-80 mt-1">All tests combined</div>
            </button>

            {pastTests.map((test, idx) => (
              <div key={test.id} className="relative pl-4 pt-2">
                {idx !== pastTests.length - 1 && (
                  <div className="absolute left-1.5 top-8 bottom-0 w-0.5 bg-border -mb-2"></div>
                )}
                <div className="absolute left-0 top-6 w-3 h-3 rounded-full bg-primary ring-4 ring-background"></div>
                
                <button
                  onClick={() => setSelectedTestId(test.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all mt-2",
                    selectedTestId === test.id ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                  )}
                >
                  <div className="font-semibold text-sm">{test.name}</div>
                  <div className="text-xs opacity-80 mt-1">{test.date}</div>
                </button>
              </div>
            ))}
            {pastTests.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No past tests available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="md:col-span-3 flex flex-col space-y-6">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>
                {selectedTestId === "all" ? "Overall Skill Proficiency" : pastTests.find(t => t.id === selectedTestId)?.name}
              </CardTitle>
              <CardDescription>
                Radar chart visualizing your strengths and weaknesses.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="w-full h-full max-w-md max-h-96">
                <SkillGapRadar data={selectedData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Identified Weaknesses</CardTitle>
            </CardHeader>
            <CardContent>
              {weakTopics.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {weakTopics.map((topic: any, i: number) => (
                    <FlipCard
                      key={i}
                      trigger="click"
                      axis="x"
                      className="h-28"
                      front={
                        <div className="w-full h-full p-4 rounded-xl border border-destructive/20 bg-destructive/5 shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center justify-center text-center transition-all">
                          <span className="font-bold text-destructive">{topic.name}</span>
                          <span className="text-sm text-destructive/70 mt-1">Score: {topic.score}%</span>
                        </div>
                      }
                      back={
                        <div className="w-full h-full p-4 rounded-xl border border-primary/20 bg-primary/10 shadow-sm cursor-pointer flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-semibold text-primary mb-1">Recommended Resources:</span>
                          <span className="text-xs text-foreground">{topic.resources}</span>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No significant weaknesses identified for this selection.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
