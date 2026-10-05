import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { SkillGapRadar } from "../../components/charts/SkillGapRadar";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from "recharts";
import { motion } from "framer-motion";
import { staggerContainer, revealVariants } from "../../lib/animations";

// Consistent Color Mapping for Domains
const DOMAIN_COLORS: Record<string, string> = {
  "Full Stack": "#0ea5e9",      // sky-500
  "Cybersecurity": "#f43f5e",   // rose-500
  "Cloud & DevOps": "#8b5cf6",  // violet-500
  "AI / ML": "hsl(var(--success))",         // emerald-500
};

// Mock Data
const kpis = {
  totalStudents: 2450,
  totalTests: 18400,
  overallPassRate: 68,
  certsIssued: 8900,
  activeDomains: 4
};

const overallPassRateData = [
  { name: 'Passed', value: 68, color: 'hsl(var(--success))' }, // emerald-500
  { name: 'Failed', value: 32, color: '#f43f5e' }, // rose-500
];

const passRateByDomain = [
  { domain: 'Full Stack', passRate: 72 },
  { domain: 'Cybersecurity', passRate: 65 },
  { domain: 'Cloud & DevOps', passRate: 60 },
  { domain: 'AI / ML', passRate: 75 },
];

const passRateByLevel = [
  { level: 'Entrance', 'Full Stack': 80, 'Cybersecurity': 75, 'Cloud & DevOps': 70, 'AI / ML': 85 },
  { level: 'Level 1', 'Full Stack': 70, 'Cybersecurity': 65, 'Cloud & DevOps': 60, 'AI / ML': 75 },
  { level: 'Level 2', 'Full Stack': 60, 'Cybersecurity': 55, 'Cloud & DevOps': 50, 'AI / ML': 65 },
  { level: 'Level 3', 'Full Stack': 50, 'Cybersecurity': 45, 'Cloud & DevOps': 40, 'AI / ML': 55 },
];

const attemptsDistribution = [
  { attempt: 'Attempt 1', passed: 1200 },
  { attempt: 'Attempt 2', passed: 800 },
  { attempt: 'Attempt 3', passed: 400 },
  { attempt: 'Failed Out', passed: 150 }, // students who exhausted attempts
];

const entranceConversion = [
  { domain: 'Full Stack', Attempted: 1000, Cleared: 800 },
  { domain: 'Cybersecurity', Attempted: 800, Cleared: 600 },
  { domain: 'Cloud & DevOps', Attempted: 700, Cleared: 490 },
  { domain: 'AI / ML', Attempted: 900, Cleared: 765 },
];

const certsIssuedTimeline = [
  { month: 'Jan', certs: 120 }, { month: 'Feb', certs: 210 },
  { month: 'Mar', certs: 450 }, { month: 'Apr', certs: 800 },
  { month: 'May', certs: 1200 }, { month: 'Jun', certs: 1800 },
];

const studentDistributionBySemester = [
  { sem: 'Sem 1', count: 400 },
  { sem: 'Sem 2', count: 380 },
  { sem: 'Sem 3', count: 420 },
  { sem: 'Sem 4', count: 450 },
  { sem: 'Sem 5', count: 410 },
  { sem: 'Sem 6', count: 390 },
];

const studentDistributionByDomain = [
  { name: 'Full Stack', value: 850 },
  { name: 'Cybersecurity', value: 650 },
  { name: 'AI / ML', value: 550 },
  { name: 'Cloud & DevOps', value: 400 },
];

const aggregateRadarData = [
  { subject: 'Core Fundamentals', A: 75, fullMark: 100 },
  { subject: 'Advanced Concepts', A: 55, fullMark: 100 },
  { subject: 'Practical App', A: 65, fullMark: 100 },
  { subject: 'Problem Solving', A: 70, fullMark: 100 },
  { subject: 'Architecture', A: 45, fullMark: 100 },
];

export function Analytics() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader 
        title="Institution Analytics" 
        description="Comprehensive analysis of test performance and student skill gaps."
      />

      {/* KPI Row */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-5 mb-6">
        <motion.div variants={revealVariants}><Card className="bg-primary/5 border-primary/20"><CardHeader className="py-4"><CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{kpis.totalStudents.toLocaleString()}</div></CardContent></Card></motion.div>
        <motion.div variants={revealVariants}><Card className="bg-primary/5 border-primary/20"><CardHeader className="py-4"><CardTitle className="text-sm font-medium text-muted-foreground">Tests Conducted</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{kpis.totalTests.toLocaleString()}</div></CardContent></Card></motion.div>
        <motion.div variants={revealVariants}><Card className="bg-primary/5 border-primary/20"><CardHeader className="py-4"><CardTitle className="text-sm font-medium text-muted-foreground">Overall Pass Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-success">{kpis.overallPassRate}%</div></CardContent></Card></motion.div>
        <motion.div variants={revealVariants}><Card className="bg-primary/5 border-primary/20"><CardHeader className="py-4"><CardTitle className="text-sm font-medium text-muted-foreground">Certificates Issued</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{kpis.certsIssued.toLocaleString()}</div></CardContent></Card></motion.div>
        <motion.div variants={revealVariants}><Card className="bg-primary/5 border-primary/20"><CardHeader className="py-4"><CardTitle className="text-sm font-medium text-muted-foreground">Active Domains</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{kpis.activeDomains}</div></CardContent></Card></motion.div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Overall Pass Rate Donut */}
        <motion.div variants={revealVariants} className="col-span-1">
          <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Overall Pass Rate</CardTitle>
            <CardDescription>Success rate across all tests</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={overallPassRateData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {overallPassRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `${val}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>

        {/* Pass Rate By Domain */}
        <motion.div variants={revealVariants} className="col-span-1 lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Pass Rate by Domain</CardTitle>
            <CardDescription>Comparison of success rates across tracks</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passRateByDomain} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="domain" />
                <YAxis tickFormatter={(tick) => `${tick}%`} />
                <Tooltip formatter={(val: any) => `${val}%`} />
                <Bar dataKey="passRate" radius={[4, 4, 0, 0]}>
                  {passRateByDomain.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DOMAIN_COLORS[entry.domain] || '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Entrance Test Conversion */}
        <motion.div variants={revealVariants}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Entrance Test Conversion</CardTitle>
            <CardDescription>Attempted vs Cleared per domain</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entranceConversion} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="domain" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Attempted" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cleared" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>

        {/* Pass Rate by Level */}
        <motion.div variants={revealVariants}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Pass Rate by Level</CardTitle>
            <CardDescription>Success rate degradation across difficulty tiers</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passRateByLevel} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="level" />
                <YAxis tickFormatter={(tick) => `${tick}%`} />
                <Tooltip formatter={(val: any) => `${val}%`} />
                <Legend />
                <Bar dataKey="Full Stack" fill={DOMAIN_COLORS["Full Stack"]} />
                <Bar dataKey="Cybersecurity" fill={DOMAIN_COLORS["Cybersecurity"]} />
                <Bar dataKey="Cloud & DevOps" fill={DOMAIN_COLORS["Cloud & DevOps"]} />
                <Bar dataKey="AI / ML" fill={DOMAIN_COLORS["AI / ML"]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Attempts Distribution */}
        <motion.div variants={revealVariants} className="col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Attempts to Pass</CardTitle>
            <CardDescription>When do students typically succeed?</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attemptsDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="attempt" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="passed" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>

        {/* Certificates Over Time */}
        <motion.div variants={revealVariants} className="col-span-1 lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Certificates Issued</CardTitle>
            <CardDescription>Cumulative growth over the semester</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={certsIssuedTimeline} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="certs" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demographic: Domains */}
        <motion.div variants={revealVariants} className="col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Students by Domain</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={studentDistributionByDomain} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {studentDistributionByDomain.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DOMAIN_COLORS[entry.name] || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>
        
        {/* Demographic: Semesters */}
        <motion.div variants={revealVariants} className="col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Students by Semester</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentDistributionBySemester} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="sem" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </motion.div>

        {/* Aggregate Skill Gap Radar */}
        <motion.div variants={revealVariants} className="col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Aggregate Skill Profile</CardTitle>
            <CardDescription>Institution-wide strengths & weaknesses</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="w-full h-full max-w-sm">
              <SkillGapRadar data={aggregateRadarData} />
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
