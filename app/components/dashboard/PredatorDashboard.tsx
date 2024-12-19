"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Swords, Crown, Flame, Star, Trophy, PhoneCall, Calendar, Users, DollarSign } from 'lucide-react';
import { fetchSheetData, filterDataByDateRange, fetchProjections } from './sheets';
import { fetchMarketingData, fetchMarketingProjections } from '../lib/marketingSheets';
import TargetBarChart from './TargetBarChart';
import MarketingDashboard from './MarketingDashboard';

type MetricCardProps = {
  title: string;
  value: string | number;
  rate: string;
  rateValue: string | number;
  xp: string;
  icon: React.ComponentType<any>;
};

type Metrics = {
  totalOutbound: number;
  totalTriage: number;
  totalAppointments: number;
  totalShows: number;
  totalCloses: number;
  totalRevenue: number;
  totalXP: number;
};

type ChartData = {
  outbound?: number;
  triage?: number;
  appointments?: number;
  shows?: number;
  closes?: number;
};

const getRateColor = (title: string, rate: number): string => {
  const value = parseFloat(String(rate).replace('%', ''));
  
  switch (title) {
    case 'OUTBOUND':
      if (value >= 5) return 'text-green-400';
      if (value >= 3) return 'text-yellow-400';
      return 'text-red-400';
      
    case 'TRIAGE':
      if (value >= 50) return 'text-green-400';
      if (value >= 30) return 'text-yellow-400';
      return 'text-red-400';
      
    case 'APPOINTMENTS':
      if (value >= 80) return 'text-green-400';
      if (value >= 70) return 'text-yellow-400';
      return 'text-red-400';
      
    case 'CLOSES':
      if (value >= 30) return 'text-green-400';
      if (value >= 20) return 'text-yellow-400';
      return 'text-red-400';
      
    default:
      return 'text-white';
  }
};

export default function PredatorDashboard() {
  const [dashboardType, setDashboardType] = useState('sales');
  const [dateRange, setDateRange] = useState('7');
  const [data, setData] = useState<any[]>([]);
  const [marketingData, setMarketingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(7);
  const [totalXP, setTotalXP] = useState(0);
  const [nextLevelXP] = useState(50000);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [projections, setProjections] = useState<any>(null);

  const progressToLevel25 = Math.min((totalXP / nextLevelXP) * 100, 100);

  const calculateStreak = (data: any[], projections: any) => {
    if (!data.length || !projections?.outbound?.daily) return 0;
    
    const sortedData = [...data].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  
    let streak = 0;
    const target = projections.outbound.daily;
  
    for (let i = 0; i < sortedData.length; i++) {
      if (sortedData[i].outbound >= target) {
        streak++;
      } else {
        break;
      }
    }
  
    return streak;
  };

  const calculateMetrics = (): Metrics => {
    if (!data.length) return {
      totalOutbound: 0,
      totalTriage: 0,
      totalAppointments: 0,
      totalShows: 0,
      totalCloses: 0,
      totalRevenue: 0,
      totalXP: 0
    };

    return data.reduce((acc, curr) => ({
      totalOutbound: acc.totalOutbound + (Number(curr.outbound) || 0),
      totalTriage: acc.totalTriage + (Number(curr.triage) || 0),
      totalAppointments: acc.totalAppointments + (Number(curr.appointments) || 0),
      totalShows: acc.totalShows + (Number(curr.shows) || 0),
      totalCloses: acc.totalCloses + (Number(curr.closes) || 0),
      totalRevenue: acc.totalRevenue + (Number(curr.revenue) || 0),
      totalXP: acc.totalXP + (Number(curr.totalXP) || 0)
    }), {
      totalOutbound: 0,
      totalTriage: 0,
      totalAppointments: 0,
      totalShows: 0,
      totalCloses: 0,
      totalRevenue: 0,
      totalXP: 0
    });
  };

  const formatDataForBarChart = (data: any[]) => {
    const dailyData = data[data.length - 1] || {};
    
    const weeklyData = data.slice(-7).reduce((acc, curr) => ({
      outbound: (acc.outbound || 0) + (Number(curr.outbound) || 0),
      triage: (acc.triage || 0) + (Number(curr.triage) || 0),
      appointments: (acc.appointments || 0) + (Number(curr.appointments) || 0),
      shows: (acc.shows || 0) + (Number(curr.shows) || 0),
      closes: (acc.closes || 0) + (Number(curr.closes) || 0),
    }), {} as ChartData);

    const monthlyData = data.slice(-30).reduce((acc, curr) => ({
      outbound: (acc.outbound || 0) + (Number(curr.outbound) || 0),
      triage: (acc.triage || 0) + (Number(curr.triage) || 0),
      appointments: (acc.appointments || 0) + (Number(curr.appointments) || 0),
      shows: (acc.shows || 0) + (Number(curr.shows) || 0),
      closes: (acc.closes || 0) + (Number(curr.closes) || 0),
    }), {} as ChartData);

    return {
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData
    };
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sheetData, projectionsData, mktgData] = await Promise.all([
          fetchSheetData(),
          fetchProjections(),
          fetchMarketingData()
        ]);
        
        setProjections(projectionsData);
        
        if (dateRange === 'ALL') {
          setData(sheetData);
          setMarketingData(mktgData);
        } else {
          const today = new Date();
          const startDate = new Date();
          startDate.setDate(today.getDate() - parseInt(dateRange));
          const filteredData = filterDataByDateRange(sheetData, startDate.toISOString(), today.toISOString());
          const filteredMktgData = filterDataByDateRange(mktgData, startDate.toISOString(), today.toISOString());
          setData(filteredData);
          setMarketingData(filteredMktgData);

          const streak = calculateStreak(filteredData, projectionsData);
          setCurrentStreak(streak);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [dateRange]);

  useEffect(() => {
    if (data.length > 0) {
      const sum = data.reduce((acc, curr) => acc + (Number(curr.totalXP) || 0), 0);
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
        <div className="flex gap-4">
          <select 
            className="bg-gray-900 border border-red-500/30 rounded-md p-2 text-white"
            value={dashboardType}
            onChange={(e) => setDashboardType(e.target.value)}
          >
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
          </select>
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
      </div>

      {/* Level Progress */}
      <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xl text-red-500">Progress to Level 25</div>
          <div className="flex items-center gap-2 text-white">
            <span className="text-red-500 font-bold">Level {Math.floor(totalXP / 2000) + 1}</span>
            <span>|</span>
            <span>{totalXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
          </div>
        </div>
        <div className="w-full bg-gray-800 h-4 rounded-full mb-2">
          <div 
            className="bg-red-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressToLevel25}%` }}
          />
        </div>
      </div>

      {/* Dashboard Content */}
      {dashboardType === 'sales' ? (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Line Chart */}
            <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
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
                  <Line type="monotone" dataKey="outbound" name="Outbound" stroke="#ff0000" dot={false} />
                  <Line type="monotone" dataKey="triage" name="Triage" stroke="#ff4444" dot={false} />
                  <Line type="monotone" dataKey="appointments" name="Appointments" stroke="#ff8888" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
              <TargetBarChart 
                data={formatDataForBarChart(data)} 
                projections={projections || {}} 
              />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <MetricCard 
              title="OUTBOUND"
              value={metrics.totalOutbound.toLocaleString()}
              rate="Conv. Rate"
              rateValue={`${((metrics.totalTriage / metrics.totalOutbound * 100) || 0).toFixed(1)}%`}
              xp="+1 XP each"
              icon={Target}
            />
            <MetricCard 
              title="TRIAGE"
              value={metrics.totalTriage.toLocaleString()}
              rate="Set Rate"
              rateValue={`${((metrics.totalAppointments / metrics.totalTriage * 100) || 0).toFixed(1)}%`}
              xp="+10 XP each"
              icon={Swords}
            />
            <MetricCard 
              title="APPOINTMENTS"
              value={metrics.totalAppointments.toLocaleString()}
              rate="Show Rate"
              rateValue={`${((metrics.totalShows / metrics.totalAppointments * 100) || 0).toFixed(1)}%`}
              xp="+25 XP each"
              icon={Calendar}
            />
            <MetricCard 
              title="CLOSES"
              value={metrics.totalCloses.toLocaleString()}
              rate="Close Rate"
              rateValue={`${((metrics.totalCloses / metrics.totalShows * 100) || 0).toFixed(1)}%`}
              xp="+100 XP each"
              icon={Flame}
            />
            <MetricCard 
              title="REVENUE"
              value={`$${metrics.totalRevenue.toLocaleString()}`}
              rate="Per Close"
              rateValue={`$${Math.round(metrics.totalRevenue / metrics.totalCloses || 0).toLocaleString()}`}
              xp="Level Bonus: 2x"
              icon={DollarSign}
            />
          </div>
        </>
      ) : (
        <MarketingDashboard 
          marketingData={marketingData}
          dateRange={dateRange}
          onDateRangeChange={(range) => setDateRange(range)}
        />
      )}
    </div>
  );
}

function MetricCard({ title, value, rate, rateValue, xp, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-300">{title}</span>
        {Icon &&{Icon && <Icon className="text-red-500" />}
      </div>
      <div className="text-2xl font-bold mb-1 text-white">{value}</div>
      <div className="text-sm text-gray-300">{rate}</div>
      <div className={`text-lg font-bold ${getRateColor(title, parseFloat(String(rateValue)))}`}>
        {rateValue}
      </div>
      <div className="text-xs text-red-500 mt-2">{xp}</div>
    </div>
  );
}