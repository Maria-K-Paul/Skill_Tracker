import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface DomainDistributionPieProps {
  data: { name: string; value: number }[];
}

export function DomainDistributionPie({ data }: DomainDistributionPieProps) {
  const COLORS = ['#0EA5A0', '#0B1F3A', '#f59e0b', '#8b5cf6'];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
