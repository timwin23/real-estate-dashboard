// app/components/real-estate-dashboard/MarketingDashboard.tsx
"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Crown, Flame, Star, PhoneCall, Users } from 'lucide-react';
import MarketingTargetBarChart from './MarketingTargetBarChart';

type MetricCardProps = {
    title: string;
    value: string | number;
    rate?: string;
    rateValue?: string | number;
    xp?: string;
    icon: React.ComponentType<any>;
};

type MarketingMetrics = {
    totalOutboundMessages: number;
    totalPositiveResponses: number;
    totalPostsCreated: number;
    totalLeadsGenerated: number;
    marketingXP: number;
    responseRate: number;
    leadsPerPost?: number;
};

interface MetricsFormat {
    [key: string]: number;
    outboundMessages: number;
    positiveResponses: number;
    postsCreated: number;
    leadsGenerated: number;
}


const getRateColor = (title: string, rate?: number): string => {
      if (rate === undefined) return 'text-white';
    const value = parseFloat(String(rate).replace('%', ''));

  switch (title) {
         case 'OUTBOUND':
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
    onDateRangeChange,
    projections,
    teamMember
}: {
    marketingData: any[];
    dateRange: string;
    onDateRangeChange: (range: string) => void;
    projections: any;
    teamMember: string;
}) {
    const calculateMetrics = (): MarketingMetrics => {
       if (!marketingData || marketingData.length === 0) {
             return {
                totalOutboundMessages: 0,
                totalPositiveResponses: 0,
                totalPostsCreated: 0,
                totalLeadsGenerated: 0,
                marketingXP: 0,
                responseRate: 0,
                leadsPerPost:0
            };
        }

        const totals = marketingData.reduce((acc, curr) => {
            return {
                  totalOutboundMessages: acc.totalOutboundMessages + (curr.outboundMessages || 0),
                totalPositiveResponses: acc.totalPositiveResponses + (curr.positiveResponses || 0),
                totalPostsCreated: acc.totalPostsCreated + (curr.postsCreated || 0),
                totalLeadsGenerated: acc.totalLeadsGenerated + (curr.leadsGenerated || 0),
                 marketingXP: acc.marketingXP + (curr.marketingXP || 0)

            };
        }, {
                 totalOutboundMessages: 0,
                totalPositiveResponses: 0,
                totalPostsCreated: 0,
                 totalLeadsGenerated: 0,
                 marketingXP:0
        });


         const metrics = {
             ...totals,
            responseRate: (totals.totalPositiveResponses / totals.totalOutboundMessages * 100) || 0,
             leadsPerPost: (totals.totalLeadsGenerated / totals.totalPostsCreated) || 0
        };

        return metrics;
    };

    const formatDataForBarChart = (data: any[]) => {
       const dailyData = data[data.length - 1] || {};
        const formatMetrics = (row: any): MetricsFormat => {
             return {
                outboundMessages: row.outboundMessages || 0,
                positiveResponses: row.positiveResponses || 0,
                postsCreated: row.postsCreated || 0,
                leadsGenerated: row.leadsGenerated || 0
            };
        };

         const weeklyData = data.slice(-7).reduce((acc, curr) => {
            const metrics = formatMetrics(curr);
             return {
                ...acc,
                outboundMessages: (acc.outboundMessages || 0) + metrics.outboundMessages,
                positiveResponses: (acc.positiveResponses || 0) + metrics.positiveResponses,
                postsCreated: (acc.postsCreated || 0) + metrics.postsCreated,
                leadsGenerated: (acc.leadsGenerated || 0) + metrics.leadsGenerated
            };
        }, {} as MetricsFormat);


        const monthlyData = data.slice(-30).reduce((acc, curr) => {
             const metrics = formatMetrics(curr);
            return {
                ...acc,
                  outboundMessages: (acc.outboundMessages || 0) + metrics.outboundMessages,
                positiveResponses: (acc.positiveResponses || 0) + metrics.positiveResponses,
                  postsCreated: (acc.postsCreated || 0) + metrics.postsCreated,
                leadsGenerated: (acc.leadsGenerated || 0) + metrics.leadsGenerated
            };
        }, {} as MetricsFormat);


        return {
            daily: formatMetrics(dailyData),
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
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
                    <MarketingTargetBarChart
                        data={formatDataForBarChart(marketingData)}
                       projections={projections?.[teamMember] || {}}
                    />
                </div>
            </div>

            {/* Metrics Grid */}
             <div className="grid grid-cols-3 gap-4 mb-6">
                <MetricCard
                    title="OUTBOUND"
                    value={metrics.totalOutboundMessages.toLocaleString()}
                    rate="Response Rate"
                    rateValue={`${metrics.responseRate.toFixed(1)}%`}
                      xp="+1 XP each"
                    icon={Target}
                />
                   <MetricCard
                    title="POSTS"
                    value={metrics.totalPostsCreated.toLocaleString()}
                    rate="Leads per Post"
                     rateValue={metrics.leadsPerPost?.toFixed(1)}
                       xp="+25 XP each"
                      icon={Star}
                />
                 <MetricCard
                    title="LEADS"
                    value={metrics.totalLeadsGenerated.toLocaleString()}
                    rate="Leads Created"
                      rateValue={`${metrics.leadsPerPost?.toFixed(1)}`}
                    xp="+25 XP each"
                      icon={Users}
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
             {rate && <div className="text-sm text-gray-300">{rate}</div>}
              {rateValue &&<div className={`text-lg font-bold ${getRateColor(title, parseFloat(String(rateValue)))}`}>
                {rateValue}
            </div>}
           {xp && <div className="text-xs text-red-500 mt-2">{xp}</div>}
        </div>
    );
}