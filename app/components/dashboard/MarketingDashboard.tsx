"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Crown, Flame, Star, PhoneCall, Users } from 'lucide-react';
import MarketingTargetBarChart from './MarketingTargetBarChart';

type MetricCardProps = {
  title: string;
  value: string | number;
  rate: string;
  rateValue: string | number;
  xp: string;
  icon: React.ComponentType<any>;
};

type MarketingMetrics = {
  totalOutbound: number;
  totalResponses: number;
  totalVSLViews: number;
  totalTrials: number;
  totalPaid: number;
  totalPosts: number;
  totalLeads: number;
  marketingXP: number;
  responseRate: number;
  vslViewRate: number;
  trialRate: number;
  paidRate: number;
  leadsPerPost: number;
};

const getRateColor = (title: string, rate: number): string => {
  const value = parseFloat(String(rate).replace('%', ''));
  
  switch (title) {
    case 'OUTBOUND':
    case 'RESPONSES':
    case 'VSL VIEWS':
    case 'TRIALS':
      if (value >= 5) return 'text-green-400';
      if (value >= 3) return 'text-yellow-400';
      return 'text-red-400';
      
    default:
      return 'text-white';
  }
};

export default function MarketingDashboard({ 
  marketingData, 
  dateRange, 
  onDateRangeChange 
}: { 
  marketingData: any[];
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}) {
  const calculateMetrics = (): MarketingMetrics => {
    if (!marketingData.length) return {
      totalOutbound: 0,
      totalResponses: 0,
      totalVSLViews: 0,
      totalTrials: 0,
      totalPaid: 0,
      totalPosts: 0,
      totalLeads: 0,
      marketingXP: 0,
      responseRate: 0,
      vslViewRate: 0,
      trialRate: 0,
      paidRate: 0,
      leadsPerPost: 0
    };

    const totals = marketingData.reduce((acc, curr) => ({
      totalOutbound: acc.totalOutbound + (curr.outboundMessages || 0),
      totalResponses: acc.totalResponses + (curr.positiveResponses || 0),
      totalVSLViews: acc.totalVSLViews + (curr.vslViews || 0),
      totalTrials: acc.totalTrials + (curr.trialUsers || 0),
      totalPaid: acc.totalPaid + (curr.paidUsers || 0),
      totalPosts: acc.totalPosts + (curr.postsCreated || 0),
      totalLeads: acc.totalLeads + (curr.leadsGenerated || 0),
      marketingXP: acc.marketingXP + (curr.marketingXP || 0)
    }), {
      totalOutbound: 0,
      totalResponses: 0,
      totalVSLViews: 0,
      totalTrials: 0,
      totalPaid: 0,
      totalPosts: 0,
      totalLeads: 0,
      marketingXP: 0
    });

    return {
      ...totals,
      responseRate: (totals.totalResponses / totals.totalOutbound * 100) || 0,
      vslViewRate: (totals.totalVSLViews / totals.totalResponses * 100) || 0,
      trialRate: (totals.totalTrials / totals.totalVSLViews * 100) || 0,
      paidRate: (totals.totalPaid / totals.totalTrials * 100) || 0,
      leadsPerPost: (totals.totalLeads / totals.totalPosts) || 0
    };
  };

  const formatDataForBarChart = (data: any[]) => {
    const dailyData = data[data.length - 1] || {};
    
    const weeklyData = data.slice(-7).reduce((acc, curr) => ({
      outboundMessages: (acc.outboundMessages || 0) + (curr.outboundMessages || 0),
      positiveResponses: (acc.positiveResponses || 0) + (curr.positiveResponses || 0),
      vslViews: (acc.vslViews || 0) + (curr.vslViews || 0),
      trialUsers: (acc.trialUsers || 0) + (curr.trialUsers || 0),
      paidUsers: (acc.paidUsers || 0) + (curr.paidUsers || 0)
    }), {});

    const monthlyData = data.slice(-30).reduce((acc, curr) => ({
      outboundMessages: (acc.outboundMessages || 0) + (curr.outboundMessages || 0),
      positiveResponses: (acc.positiveResponses || 0) + (curr.positiveResponses || 0),
      vslViews: (acc.vslViews || 0) + (curr.vslViews || 0),
      trialUsers: (acc.trialUsers || 0) + (curr.trialUsers || 0),
      paidUsers: (acc.paidUsers || 0) + (curr.paidUsers || 0)
    }), {});

    return {
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData
    };
  };

  const metrics = calculateMetrics();

  return (
    <div>
      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Line Chart */}
        <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={marketingData}>
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
              <Line type="monotone" dataKey="outboundMessages" name="Outbound" stroke="#ff0000" dot={false} />
              <Line type="monotone" dataKey="positiveResponses" name="Responses" stroke="#ff4444" dot={false} />
              <Line type="monotone" dataKey="vslViews" name="VSL Views" stroke="#ff8888" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
          <MarketingTargetBarChart 
            data={formatDataForBarChart(marketingData)} 
            projections={{}} 
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <MetricCard 
          title="OUTBOUND"
          value={metrics.totalOutbound.toLocaleString()}
          rate="Response Rate"
          rateValue={`${metrics.responseRate.toFixed(1)}%`}
          xp="+1 XP each"
          icon={Target}
        />
        <MetricCard 
          title="VSL VIEWS"
          value={metrics.totalVSLViews.toLocaleString()}
          rate="View Rate"
          rateValue={`${metrics.vslViewRate.toFixed(1)}%`}
          xp="+5 XP each"
          icon={PhoneCall}
        />
        <MetricCard 
          title="TRIALS"
          value={metrics.totalTrials.toLocaleString()}
          rate="Trial Rate"
          rateValue={`${metrics.trialRate.toFixed(1)}%`}
          xp="+25 XP each"
          icon={Users}
        />
        <MetricCard 
          title="PAID USERS"
          value={metrics.totalPaid.toLocaleString()}
          rate="Conversion Rate"
          rateValue={`${metrics.paidRate.toFixed(1)}%`}
          xp="+100 XP each"
          icon={Crown}
        />
        <MetricCard 
          title="POSTS"
          value={metrics.totalPosts.toLocaleString()}
          rate="Leads per Post"
          rateValue={metrics.leadsPerPost.toFixed(1)}
          xp="+25 XP each"
          icon={Star}
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value, rate, rateValue, xp, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-300">{title}</span>
        {Icon && <Icon className="text-red-500" />}
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