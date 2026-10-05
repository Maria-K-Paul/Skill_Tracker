import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface SkillGapRadarProps {
  data: { subject: string; A: number; fullMark: number }[];
}

export function SkillGapRadar({ data }: SkillGapRadarProps) {
  // Find the weakest score to pulse it
  const weakestScore = Math.min(...data.map(d => d.A));

  // Custom dot rendering to pulse the weakest skill point
  const CustomDot = (props: any) => {
    const { cx, cy, value } = props;
    if (value === weakestScore) {
      return (
        <motion.circle
          cx={cx}
          cy={cy}
          r={6}
          fill="hsl(var(--destructive))"
          stroke="hsl(var(--background))"
          strokeWidth={2}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={1} />;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar 
            name="Student Score" 
            dataKey="A" 
            stroke="hsl(var(--primary))" 
            fill="hsl(var(--primary))" 
            fillOpacity={0.4} 
            dot={<CustomDot />}
            isAnimationActive={true}
            animationBegin={200}
            animationDuration={1500}
            animationEasing="ease-out"
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
