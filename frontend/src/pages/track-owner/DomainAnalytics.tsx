import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../../hooks/useAuth";

const passRateData = [
  { name: "Level 1", passed: 45, failed: 12 },
  { name: "Level 2", passed: 30, failed: 25 },
  { name: "Level 3", passed: 15, failed: 10 },
];

const topicPerformance = [
  { name: "Frontend Basics", value: 85 },
  { name: "Backend Logic", value: 65 },
  { name: "Database Design", value: 40 },
  { name: "System Arch", value: 20 },
];

const COLORS = ["#0ea5e9", "#f43f5e", "#10b981", "#8b5cf6"];

export function DomainAnalytics() {
  const { user } = useAuth();
  const domain = user?.domain || "Unknown Domain";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader 
        title={`${domain} Analytics`}
        description="Monitor student performance and pass rates for your domain."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">185</div>
            <p className="text-xs text-muted-foreground mt-1">+12 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">68%</div>
            <p className="text-xs text-muted-foreground mt-1">+4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.8</div>
            <p className="text-xs text-muted-foreground mt-1">Per level cleared</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Skill Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-500">System Arch</div>
            <p className="text-xs text-muted-foreground mt-1">Only 20% proficiency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pass vs Fail by Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={passRateData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="passed" fill="#10b981" name="Passed" />
                  <Bar dataKey="failed" fill="#f43f5e" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic Proficiency Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topicPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-sm mt-4">
              {topicPerformance.map((topic, i) => (
                <div key={topic.name} className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  {topic.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
