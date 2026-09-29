import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function TestScheduling() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader 
        title="Schedule Test Window" 
        description="Define the time window during which students can book slots for this level."
      />

      <Card>
        <CardHeader>
          <CardTitle>Level 2 Main Exam</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date & Time</Label>
              <Input type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label>End Date & Time</Label>
              <Input type="datetime-local" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Booking Deadline</Label>
            <Input type="datetime-local" />
          </div>

          <Button className="w-full">Publish Schedule</Button>
        </CardContent>
      </Card>
    </div>
  );
}
