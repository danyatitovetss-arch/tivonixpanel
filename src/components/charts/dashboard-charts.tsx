"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const axisStyle = { fill: "#6b7280", fontSize: 12 };
const gridStyle = { stroke: "#e5e5e5", strokeDasharray: "3 3" };
const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e5e5e5",
  borderRadius: 8,
  fontSize: 12,
};

interface ChartProps {
  data: Record<string, string | number>[];
  dataKey: string;
  xKey: string;
  height?: number;
}

export function LeadsChart({ data, dataKey, xKey, height = 220 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={axisStyle} />
        <YAxis axisLine={false} tickLine={false} tick={axisStyle} width={32} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={dataKey} stroke="#050505" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SalesChart({ data, dataKey, xKey, height = 220 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={axisStyle} />
        <YAxis axisLine={false} tickLine={false} tick={axisStyle} width={48} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} fill="#050505" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConversionChart({
  data,
  height = 220,
}: {
  data: { stage: string; count: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid {...gridStyle} horizontal={false} />
        <XAxis type="number" axisLine={false} tickLine={false} tick={axisStyle} />
        <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={axisStyle} width={72} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill="#6b7280" radius={[0, 4, 4, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopPartnersChart({
  data,
  height = 220,
}: {
  data: { name: string; deals: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} />
        <YAxis axisLine={false} tickLine={false} tick={axisStyle} width={32} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="deals" fill="#6b7280" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
