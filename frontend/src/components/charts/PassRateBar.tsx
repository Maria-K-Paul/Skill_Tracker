import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

interface PassRateBarProps {
  data: { name: string; pass: number; fail: number }[];
}

export function PassRateBar({ data }: PassRateBarProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
          <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
          <Bar dataKey="pass" stackId="a" fill="#0EA5A0" radius={[0, 0, 4, 4]} />
          <Bar dataKey="fail" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
