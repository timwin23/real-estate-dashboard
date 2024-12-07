"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Swords, Crown, Flame, Star, Trophy, PhoneCall, Calendar, Users, DollarSign } from 'lucide-react';
import { fetchSheetData, filterDataByDateRange } from '../../lib/sheets';

export default function PredatorDashboard() {
  const [dateRange, setDateRange] = useState('7');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(7);
  const [totalXP, setTotalXP] = useState(0);  // Changed to start at 0
  const [nextLevelXP, setNextLevelXP] = useState(50000);
  const [currentStreak, setCurrentStreak] = useState(3);

  // Calculate progress percentage to Level 25
  const progressToLevel25 = (totalXP / nextLevelXP) * 100;

  // Calculate metrics from real data
  const calculateMetrics = () => {
    if (!data.length) return {
      totalDials: 0,
      totalTriage: 0,
      totalAppointments: 0,
      totalShows: 0,
      totalCloses: 0,
      totalRevenue: 0,
      totalXP: 0
    };

    return data.reduce((acc, curr) => ({
      totalDials: acc.totalDials + curr.dials,
      totalTriage: acc.totalTriage + curr.triage,
      totalAppointments: acc.totalAppointments + curr.appointments,
      totalShows: acc.totalShows + curr.shows,
      totalCloses: acc.totalCloses + curr.closes,
      totalRevenue: acc.totalRevenue + curr.revenue,
      totalXP: acc.totalXP + curr.totalXP
    }), {
      totalDials: 0,
      totalTriage: 0,
      totalAppointments: 0,
      totalShows: 0,
      totalCloses: 0,
      totalRevenue: 0,
      totalXP: 0
    });
  };

  // Fetch data on mount and when date range changes
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const sheetData = await fetchSheetData();
        
        // Calculate date range
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - parseInt(dateRange));
        
        const filteredData = filterDataByDateRange(sheetData, startDate.toISOString(), today.toISOString());
        setData(filteredData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [dateRange]);

  // Update XP when data changes
  useEffect(() => {
    if (data.length > 0) {
      const sum = data.reduce((acc, curr) => acc + (curr.totalXP || 0), 0);
      setTotalXP(sum);
    }
  }, [data]);

  const metrics = calculateMetrics();

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-white p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <h1 className="text-2xl font-bold text-red-500">PREDATOR ANALYTICS</h1>
          <div className="bg-red-900/30 px-2 py-1 rounded-md border border-red-500/30">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" />
              <span>STREAK: {currentStreak} DAYS</span>
            </div>
          </div>
        </div>
        <select 
          className="bg-gray-900 border border-red-500/30 rounded-md p-2 text-white"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="7">7 Days</option>
          <option value="30">30 Days</option>
          <option value="90">90 Days</option>
          <option value="ALL">All Time</option>
        </select>
      </div>

      {/* Level Progress */}
      <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xl text-red-500">Progress to Level 25</div>
          <div className="text-white">{totalXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</div>
        </div>
        <div className="w-full bg-gray-800 h-4 rounded-full mb-2">
          <div 
            className="bg-red-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressToLevel25}%` }}
          />
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 mb-6 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #ff0000',
                color: '#ffffff'
              }} 
            />
            <Legend />
            <Line type="monotone" dataKey="dials" stroke="#ff0000" dot={false} />
            <Line type="monotone" dataKey="triage" stroke="#ff4444" dot={false} />
            <Line type="monotone" dataKey="appointments" stroke="#ff8888" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <MetricCard 
          title="DIALS"
          value={metrics.totalDials.toLocaleString()}
          rate="Conv. Rate"
          rateValue={formatRate((metrics.totalTriage / metrics.totalDials) * 100)}
          xp="+1 XP each"
          icon={Target}
        />
        <MetricCard 
          title="CONVERSATIONS"
          value={metrics.totalTriage.toLocaleString()}
          rate="Set Rate"
          rateValue={formatRate((metrics.totalAppointments / metrics.totalTriage) * 100)}
          xp="+10 XP each"
          icon={Swords}
        />
        <MetricCard 
          title="APPOINTMENTS"
          value={metrics.totalAppointments.toLocaleString()}
          rate="Show Rate"
          rateValue={formatRate((metrics.totalShows / metrics.totalAppointments) * 100)}
          xp="+25 XP each"
          icon={Calendar}
        />
        <MetricCard 
          title="CLOSES"
          value={metrics.totalCloses.toLocaleString()}
          rate="Close Rate"
          rateValue={formatRate((metrics.totalCloses / metrics.totalShows) * 100)}
          xp="+100 XP each"
          icon={Flame}
        />
        <MetricCard 
          title="REVENUE"
          value={formatCurrency(metrics.totalRevenue)}
          rate="Per Close"
          rateValue={formatCurrency(metrics.totalRevenue / metrics.totalCloses || 0)}
          xp="Level Bonus: 2x"
          icon={DollarSign}
        />
      </div>
    </div>
  );
}

// Formatting functions
function formatRate(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(1)}%`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

// Define the MetricCardProps type
type MetricCardProps = {
  title: string;
  value: string | number;
  rate: string;
  rateValue: string | number;
  xp: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// Metric Card Component
function MetricCard({ title, value, rate, rateValue, xp, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-300">{title}</span>
        {Icon && <Icon className="text-red-500" />}
      </div>
      <div className="text-2xl font-bold mb-1 text-white">{value}</div>
      <div className="text-sm text-gray-300">{rate}</div>
      <div className="text-lg font-bold text-white">{rateValue}</div>
      <div className="text-xs text-red-500 mt-2">{xp}</div>
    </div>
  );
}