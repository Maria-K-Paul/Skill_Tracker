import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function DifficultyConfig() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader 
        title="Difficulty Configuration" 
        description="Set the distribution of difficulty levels for the main exam."
      />

      <Card>
        <CardHeader>
          <CardTitle>Level 2 Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">Difficulty Distribution (%)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Easy</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label>Medium</Label>
                <Input type="number" defaultValue="50" />
              </div>
              <div className="space-y-2">
                <Label>Hard</Label>
                <Input type="number" defaultValue="20" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">Exam Parameters</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Questions</Label>
                <Input type="number" defaultValue="40" />
              </div>
              <div className="space-y-2">
                <Label>Duration (Minutes)</Label>
                <Input type="number" defaultValue="60" />
              </div>
            </div>
          </div>

          <Button className="w-full">Save Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
}
