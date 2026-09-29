import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";

interface AttemptsFunnelProps {
  data: { attempt: string; count: number }[];
}

export function AttemptsFunnel({ data }: AttemptsFunnelProps) {
  const colors = ["#0EA5A0", "#0891b2", "#0369a1", "#1e3a8a"];
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
          <YAxis dataKey="attempt" type="category" axisLine={false} tickLine={false} tick={{ fill: '#0B1F3A', fontWeight: 500 }} />
          <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
