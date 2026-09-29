import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SkillGapRadar } from "../../components/charts/SkillGapRadar";

export function SkillGapOverview() {
  const radarData = [
    { subject: 'React', A: 80, fullMark: 100 },
    { subject: 'Node.js', A: 65, fullMark: 100 },
    { subject: 'Databases', A: 70, fullMark: 100 },
    { subject: 'System Design', A: 50, fullMark: 100 },
    { subject: 'Algorithms', A: 60, fullMark: 100 },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader 
        title="Aggregated Skill Gaps" 
        description="Overall institutional weakness areas."
      />

      <Card>
        <CardHeader>
          <CardTitle>Cohort Average (Full Stack)</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillGapRadar data={radarData} />
          <p className="mt-6 text-center text-muted-foreground text-sm">
            Note: System Design and Algorithms are the weakest areas across all Semester 5 students. 
            Consider adjusting the curriculum or adding workshop sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
