// app/components/dashboard/TargetBarChart.tsx
"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface TargetBarChartProps {
  data: any[];
  projections: any;
}

export default function TargetBarChart({ data, projections }: TargetBarChartProps) {
  // Calculate weekly totals for actual metrics
  const weeklyActuals = {
    outbound: data.slice(-7).reduce((sum, day) => sum + (day.outbound || 0), 0),
    triage: data.slice(-7).reduce((sum, day) => sum + (day.triage || 0), 0),
    appointments: data.slice(-7).reduce((sum, day) => sum + (day.appointments || 0), 0)
  };

  // Calculate percentages and determine colors
  const getColor = (actual: number, target: number) => {
    const percentage = target ? (actual / target) * 100 : 0;
    if (percentage >= 90) return "#22c55e"; // Green
    if (percentage >= 70) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

  // Format data for the bar chart
  const chartData = [
    {
      name: 'Outbound',
      actual: weeklyActuals.outbound,
      target: projections?.outbound?.weekly || 0,
      color: getColor(weeklyActuals.outbound, projections?.outbound?.weekly)
    },
    {
      name: 'Triage',
      actual: weeklyActuals.triage,
      target: projections?.triage?.weekly || 0,
      color: getColor(weeklyActuals.triage, projections?.triage?.weekly)
    },
    {
      name: 'Appointments',
      actual: weeklyActuals.appointments,
      target: projections?.appointments?.weekly || 0,
      color: getColor(weeklyActuals.appointments, projections?.appointments?.weekly)
    }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <XAxis dataKey="name" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #ff0000',
            color: '#ffffff'
          }}
          formatter={(value: number, name: string) => [
            `${value} (${((value / (chartData.find(d => d.actual === value)?.target || 1)) * 100).toFixed(1)}%)`,
            name
          ]}
        />
        <Legend />
        <Bar dataKey="actual" name="Actual">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
        <Bar dataKey="target" name="Target" fill="#666666" />
      </BarChart>
    </ResponsiveContainer>
  );
}