import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Calendar, Clock, MapPin, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export function UpcomingTest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingTest, setUpcomingTest] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`bookedSlot_${user.id}`);
    if (saved) {
      try {
        setUpcomingTest(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
    }
  }, [user]);

  if (!upcomingTest) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Upcoming Test" description="View details of your scheduled tests." />
        <Card className="text-center py-16">
          <CardContent>
            <div className="mx-auto mb-4 bg-muted p-4 rounded-full w-20 h-20 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Upcoming Tests</h2>
            <p className="text-muted-foreground mb-6">You do not have any tests scheduled at the moment.</p>
            <Button onClick={() => navigate("/student/book-slot")}>Book a Slot</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Upcoming Test" description="Details of your next scheduled examination." />
      
      <Card className="overflow-hidden border-t-4 border-t-primary shadow-md">
        <CardHeader className="bg-muted/30 pb-8">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl mb-2">{upcomingTest.testName}</CardTitle>
              <div className="flex items-center text-muted-foreground">
                <Target className="w-4 h-4 mr-1" /> {upcomingTest.domain || upcomingTest.level}
              </div>
            </div>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold tracking-wide border border-primary/20">
              CONFIRMED
            </span>
          </div>
        </CardHeader>
        <CardContent className="-mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card rounded-xl p-6 shadow-sm border relative">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <Calendar className="w-4 h-4 mr-2" /> Date
              </span>
              <span className="text-lg font-semibold">{upcomingTest.date}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="w-4 h-4 mr-2" /> Time
              </span>
              <span className="text-lg font-semibold">{upcomingTest.time}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-2" /> Venue (Allotted)
              </span>
              <span className="text-lg font-semibold text-primary">{upcomingTest.venue}</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-warning/10 dark:bg-warning/20 border border-warning/30 dark:border-warning rounded-lg">
            <h4 className="font-semibold text-warning dark:text-warning mb-2">Important Instructions</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-warning dark:text-warning/80">
              <li>Please arrive at the venue 15 minutes before the scheduled time.</li>
              <li>Wait for the invigilator to provide the unique Exam Key.</li>
              <li>You will need the Exam Key to start the test in the "Exam Taker" tab.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
