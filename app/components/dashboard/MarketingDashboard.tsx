"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Crown, Flame, Star, PhoneCall, Users } from 'lucide-react';

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
  totalXP: number;
};

const getRateColor = (title: string, rate: number): string => {
  const value = parseFloat(String(rate).replace('%', ''));
  
  switch (title) {
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
      totalXP: 0
    };

    return marketingData.reduce((acc, curr) => ({
      totalOutbound: acc.totalOutbound + (curr.outboundMessages || 0),
      totalResponses: acc.totalResponses + (curr.positiveResponses || 0),
      totalVSLViews: acc.totalVSLViews + (curr.vslViews || 0),
      totalTrials: acc.totalTrials + (curr.trialUsers || 0),
      totalPaid: acc.totalPaid + (curr.paidUsers || 0),
      totalPosts: acc.totalPosts + (curr.postsCreated || 0),
      totalLeads: acc.totalLeads + (curr.leadsGenerated || 0),
      totalXP: acc.totalXP + (curr.marketingXP || 0)
    }), {
      totalOutbound: 0,
      totalResponses: 0,
      totalVSLViews: 0,
      totalTrials: 0,
      totalPaid: 0,
      totalPosts: 0,
      totalLeads: 0,
      totalXP: 0
    });
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

        {/* Metrics Table */}
        <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
          <div className="w-full h-full overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left p-2">Metric</th>
                  <th className="text-right p-2">Value</th>
                  <th className="text-right p-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Outbound Messages</td>
                  <td className="text-right p-2">{metrics.totalOutbound}</td>
                  <td className={`text-right p-2 ${getRateColor('RESPONSES', (metrics.totalResponses / metrics.totalOutbound * 100))}`}>
                    {((metrics.totalResponses / metrics.totalOutbound * 100) || 0).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="p-2">VSL Views</td>
                  <td className="text-right p-2">{metrics.totalVSLViews}</td>
                  <td className={`text-right p-2 ${getRateColor('VSL VIEWS', (metrics.totalVSLViews / metrics.totalResponses * 100))}`}>
                    {((metrics.totalVSLViews / metrics.totalResponses * 100) || 0).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Trial Users</td>
                  <td className="text-right p-2">{metrics.totalTrials}</td>
                  <td className={`text-right p-2 ${getRateColor('TRIALS', (metrics.totalTrials / metrics.totalVSLViews * 100))}`}>
                    {((metrics.totalTrials / metrics.totalVSLViews * 100) || 0).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Posts Created</td>
                  <td className="text-right p-2">{metrics.totalPosts}</td>
                  <td className="text-right p-2">-</td>
                </tr>
                <tr>
                  <td className="p-2">Leads Generated</td>
                  <td className="text-right p-2">{metrics.totalLeads}</td>
                  <td className="text-right p-2">
                    {((metrics.totalLeads / metrics.totalPosts) || 0).toFixed(1)} per post
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <MetricCard 
          title="OUTBOUND"
          value={metrics.totalOutbound.toLocaleString()}
          rate="Response Rate"
          rateValue={`${((metrics.totalResponses / metrics.totalOutbound * 100) || 0).toFixed(1)}%`}
          xp="+1 XP each"
          icon={Target}
        />
        <MetricCard 
          title="VSL VIEWS"
          value={metrics.totalVSLViews.toLocaleString()}
          rate="View Rate"
          rateValue={`${((metrics.totalVSLViews / metrics.totalResponses * 100) || 0).toFixed(1)}%`}
          xp="+5 XP each"
          icon={PhoneCall}
        />
        <MetricCard 
          title="TRIALS"
          value={metrics.totalTrials.toLocaleString()}
          rate="Trial Rate"
          rateValue={`${((metrics.totalTrials / metrics.totalVSLViews * 100) || 0).toFixed(1)}%`}
          xp="+25 XP each"
          icon={Users}
        />
        <MetricCard 
          title="PAID USERS"
          value={metrics.totalPaid.toLocaleString()}
          rate="Conversion Rate"
          rateValue={`${((metrics.totalPaid / metrics.totalTrials * 100) || 0).toFixed(1)}%`}
          xp="+100 XP each"
          icon={Crown}
        />
        <MetricCard 
          title="POSTS"
          value={metrics.totalPosts.toLocaleString()}
          rate="Leads per Post"
          rateValue={((metrics.totalLeads / metrics.totalPosts) || 0).toFixed(1)}
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