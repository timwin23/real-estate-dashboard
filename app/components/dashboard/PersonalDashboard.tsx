// app/components/real-estate-dashboard/PersonalDashboard.tsx
"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, Flame, Target, Star, Zap } from 'lucide-react';
import PersonalAchievements from './PersonalAchievements';
import PersonalDashboard from './PersonalDashboard';

type MetricCardProps = {
  title: string;
  value: string | number;
  rate: string;
  rateValue: string | number;
  xp: string;
  icon: React.ComponentType<any>;
};

type PersonalMetrics = {
  energy: number;
  confidence: number;
  powerScore: number;
  sayDoRatio: number;
  consistencyScore: number;
  momentumScore: number;
  velocityScore: number;
  salesLevel: number;
  marketingLevel: number;
  combinedLevel: number;
};

interface Props {
  data: any[];
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  salesData: any[];
  marketingData: any[];
  projections: any;
}

const getRateColor = (title: string, rate: number): string => {
  const value = parseFloat(String(rate).replace('%', ''));
  
  switch (title) {
    case 'POWER SCORE':
    case 'SAY/DO RATIO':
    case 'CONSISTENCY':
    case 'MOMENTUM':
    case 'VELOCITY':
      if (value >= 80) return 'text-green-400';
      if (value >= 50) return 'text-yellow-400';
      return 'text-red-400';
    default:
      return 'text-white';
  }
};

const calculateSayDoRatio = (salesData: any[], marketingData: any[], projections: any) => {
  if (!projections) return 0;

  // Get this week's data
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
  
  const thisWeekSales = salesData.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startOfWeek;
  });

  const thisWeekMarketing = marketingData.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startOfWeek;
  });

  // Calculate true lead indicators only
  const metrics = {
    outbound: {
      target: projections.outbound?.weekly || 0,        // Sales outbound
      actual: thisWeekSales.reduce((acc, day) => acc + (day.outbound || 0), 0)
    },
    outboundMsgs: {
      target: projections.outbound_msgs?.weekly || 0,   // Marketing messages
      actual: thisWeekMarketing.reduce((acc, day) => acc + (day.outboundMessages || 0), 0)
    },
    posts: {
      target: projections.posts?.weekly || 0,           // Marketing posts
      actual: thisWeekMarketing.reduce((acc, day) => acc + (day.postsCreated || 0), 0)
    }
  };


  // Sum all targets and actuals
  const totalTarget = Object.values(metrics).reduce((sum, metric) => sum + metric.target, 0);
  const totalActual = Object.values(metrics).reduce((sum, metric) => sum + metric.actual, 0);

  // Calculate overall percentage
  const ratio = totalTarget ? Math.round((totalActual / totalTarget) * 100) : 0;

  return ratio;
};

const calculateConsistencyScore = (data: any[]) => {
  const last7Days = data.slice(-7);

  if (last7Days.length < 7) {
    console.warn('Not enough data for consistency calculation');
    return 0;
  }

  let consistentDays = 0;
  last7Days.forEach(day => {
    const powerScore = (Number(day.energy) + Number(day.confidence)) / 2;
    if (powerScore >= 7) consistentDays++;
  });

  const score = Math.round((consistentDays / 7) * 100);
  return score;
};

const calculateMomentumScore = (data: any[]) => {
  const last3Days = data.slice(-3);
  const previous3Days = data.slice(-6, -3);


  if (last3Days.length < 3 || previous3Days.length < 3) {
    console.warn('Not enough data for momentum calculation');
    return 0;
  }

  const currentAvg = last3Days.reduce((acc, day) => 
    acc + ((Number(day.energy) + Number(day.confidence)) / 2), 0) / 3;
  
  const prevAvg = previous3Days.reduce((acc, day) => 
    acc + ((Number(day.energy) + Number(day.confidence)) / 2), 0) / 3;

  if (prevAvg === 0) return 0;
  const momentumChange = ((currentAvg / prevAvg) - 1) * 100;
  return Math.max(-100, Math.min(100, Math.round(momentumChange)));
};

const calculateVelocityScore = (salesData: any[], marketingData: any[]) => {
  const thisWeek = {
    sales: salesData.slice(-7).reduce((acc, curr) => acc + (curr.totalXP || 0), 0),
    marketing: marketingData.slice(-7).reduce((acc, curr) => acc + (curr.marketingXP || 0), 0),
  };

  const lastWeek = {
    sales: salesData.slice(-14, -7).reduce((acc, curr) => acc + (curr.totalXP || 0), 0),
    marketing: marketingData.slice(-14, -7).reduce((acc, curr) => acc + (curr.marketingXP || 0), 0),
  };


  const thisWeekTotal = thisWeek.sales + thisWeek.marketing;
  const lastWeekTotal = lastWeek.sales + lastWeek.marketing;

  if (!lastWeekTotal) return 0;
  const velocityChange = ((thisWeekTotal / lastWeekTotal) - 1) * 100;
  return Math.max(-100, Math.min(100, Math.round(velocityChange)));
};

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

export default function PersonalDashboard({ 
  data,
  dateRange,
  onDateRangeChange,
  salesData,
  marketingData,
  projections
}: Props) {

  const calculateMetrics = (): PersonalMetrics => {
    if (!data.length) return {
      energy: 0,
      confidence: 0,
      powerScore: 0,
      sayDoRatio: 0,
      consistencyScore: 0,
      momentumScore: 0,
      velocityScore: 0,
      salesLevel: 0,
      marketingLevel: 0,
       combinedLevel: 0,
    };

    // Calculate levels
    const totalSalesXP = salesData.reduce((acc, curr) => acc + (curr.totalXP || 0), 0);
    const totalMarketingXP = marketingData.reduce((acc, curr) => acc + (curr.marketingXP || 0), 0);
    
    const salesLevel = Math.floor(totalSalesXP / 2000) + 1;
    const marketingLevel = Math.floor(totalMarketingXP / 2000) + 1;
    
    const combinedLevel = Math.floor((salesLevel + marketingLevel) / 2);

    // Calculate basic metrics
    const lastEntry = data[data.length - 1] || {};
    const energy = lastEntry?.energy || 0;
    const confidence = lastEntry?.confidence || 0;
    const powerScore = Math.round(((energy + confidence) / 2) * 10) / 10;

    // Calculate metrics using helper functions
    const sayDoRatio = calculateSayDoRatio(salesData, marketingData, projections);
    const consistencyScore = calculateConsistencyScore(data);
    const momentumScore = calculateMomentumScore(data);
    const velocityScore = calculateVelocityScore(salesData, marketingData);

    return {
      energy,
      confidence,
      powerScore,
      sayDoRatio,
      consistencyScore,
      momentumScore,
      velocityScore,
      salesLevel,
      marketingLevel,
      combinedLevel,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div>
      {/* Attribute Levels */}
       <div className="bg-gray-900 border border-red-500/20 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-stretch w-full gap-4">
          <div className="flex gap-4 flex-1">
            <div className="flex-1 flex flex-col items-center bg-gray-800 rounded-lg p-6 border border-red-500/20">
              <span className="text-md text-gray-400">Sales</span>
              <span className="text-3xl text-red-500 font-bold">L{metrics.salesLevel}</span>
            </div>
            <div className="flex-1 flex flex-col items-center bg-gray-800 rounded-lg p-6 border border-red-500/20">
              <span className="text-md text-gray-400">Marketing</span>
              <span className="text-3xl text-red-500 font-bold">L{metrics.marketingLevel}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center bg-red-500/10 rounded-lg p-6 border-2 border-red-500/20">
            <span className="text-md text-gray-400">Average Level</span>
            <span className="text-4xl text-red-500 font-bold">L{metrics.combinedLevel}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Energy & Confidence Chart */}
        <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="date" 
                stroke="#666"
                 tickFormatter={(value) => {
                  if (!value) return '';
                  const date = new Date(value);
                  return date.toLocaleDateString();
                }}
              />
              <YAxis stroke="#666" domain={[0, 10]} />
              <Tooltip 
                 contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #ff0000',
                  color: '#ffffff'
                }}
                 labelFormatter={(value) => {
                  if (!value) return '';
                  const date = new Date(value);
                  return date.toLocaleDateString();
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="energy" name="Energy" stroke="#ff0000" dot={false} />
              <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#ff4444" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Achievements Panel */}
        <PersonalAchievements 
          salesData={salesData}
          marketingData={marketingData}
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <MetricCard 
          title="POWER SCORE"
          value={metrics.powerScore.toFixed(1)}
          rate="Daily Score"
          rateValue={`${((metrics.powerScore / 10) * 100).toFixed(1)}%`}
          xp="Energy + Confidence"
          icon={Brain}
        />
        <MetricCard 
          title="SAY/DO RATIO"
          value={`${metrics.sayDoRatio}%`}
          rate="Weekly Targets"
           rateValue={`${metrics.sayDoRatio}%`}
          xp="Lead Indicators Only"
          icon={Target}
        />
        <MetricCard 
          title="CONSISTENCY"
          value={`${metrics.consistencyScore}%`}
          rate="7-Day Score"
           rateValue={`${metrics.consistencyScore}%`}
          xp="Target Achievement"
          icon={Star}
        />
        <MetricCard 
          title="MOMENTUM"
          value={`${metrics.momentumScore}%`}
          rate="3-Day Trend"
           rateValue={`${metrics.momentumScore}%`}
          xp="Performance Delta"
          icon={Flame}
        />
        <MetricCard 
          title="VELOCITY"
          value={`${metrics.velocityScore}%`}
          rate="XP Growth Rate"
          rateValue={`${metrics.velocityScore}%`}
          xp="Level Progression"
          icon={Zap}
        />
      </div>
    </div>
  );
}