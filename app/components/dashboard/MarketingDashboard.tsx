// app/components/real-estate-dashboard/MarketingDashboard.tsx
"use client";

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Crown, Flame, Star, PhoneCall, Users, DollarSign, TrendingUp } from 'lucide-react';
import MarketingTargetBarChart from './MarketingTargetBarChart';

type MetricCardProps = {
    title: string;
    value: string | number;
    rate?: string;
    rateValue?: string | number;
    xp?: string;
    icon: React.ComponentType<any>;
};

interface MarketingMetrics {
    totalOutboundMessages: number;
    totalPositiveResponses: number;
    totalPostsCreated: number;
    totalLeadsGenerated: number;
    totalRevenue: number;
    marketingXP: number;
    responseRate: number;
    leadsPerPost: number;
    revenuePerClose: number;
}

interface MetricsFormat {
    [key: string]: number;
    outboundMessages: number;
    positiveResponses: number;
    postsCreated: number;
    leadsGenerated: number;
}

const DATE_RANGES = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    ALL: 'all'
} as const;

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
    const [selectedRange, setSelectedRange] = useState<keyof typeof DATE_RANGES>('WEEK');

    const calculateMetrics = (): MarketingMetrics => {
        if (!marketingData || marketingData.length === 0) {
            return {
                totalOutboundMessages: 0,
                totalPositiveResponses: 0,
                totalPostsCreated: 0,
                totalLeadsGenerated: 0,
                totalRevenue: 0,
                marketingXP: 0,
                responseRate: 0,
                leadsPerPost: 0,
                revenuePerClose: 0
            };
        }

        const now = new Date();
        const filteredData = marketingData.filter(entry => {
            const entryDate = new Date(entry.date);
            switch (selectedRange) {
                case 'DAY':
                    return entryDate.toDateString() === now.toDateString();
                case 'WEEK':
                    const weekAgo = new Date(now);
                    weekAgo.setDate(now.getDate() - 7);
                    return entryDate >= weekAgo;
                case 'MONTH':
                    const monthAgo = new Date(now);
                    monthAgo.setMonth(now.getMonth() - 1);
                    return entryDate >= monthAgo;
                case 'ALL':
                    return true;
                default:
                    return true;
            }
        });

        const totals = filteredData.reduce((acc, curr) => ({
            totalOutboundMessages: acc.totalOutboundMessages + (curr.outboundMessages || 0),
            totalPositiveResponses: acc.totalPositiveResponses + (curr.positiveResponses || 0),
            totalPostsCreated: acc.totalPostsCreated + (curr.postsCreated || 0),
            totalLeadsGenerated: acc.totalLeadsGenerated + (curr.leadsGenerated || 0),
            totalRevenue: acc.totalRevenue + (curr.revenue || 0),
            marketingXP: acc.marketingXP + (curr.marketingXP || 0)
        }), {
            totalOutboundMessages: 0,
            totalPositiveResponses: 0,
            totalPostsCreated: 0,
            totalLeadsGenerated: 0,
            totalRevenue: 0,
            marketingXP: 0
        });

        return {
            ...totals,
            responseRate: (totals.totalPositiveResponses / totals.totalOutboundMessages * 100) || 0,
            leadsPerPost: (totals.totalLeadsGenerated / totals.totalPostsCreated) || 0,
            revenuePerClose: totals.totalRevenue / totals.totalLeadsGenerated || 0
        };
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

    const metricsCards = [
        {
            title: "OUTBOUND",
            value: metrics.totalOutboundMessages.toLocaleString(),
            rate: "Response Rate",
            rateValue: `${metrics.responseRate.toFixed(1)}%`,
            xp: "+1 XP each",
            icon: Target
        },
        {
            title: "RESPONSES",
            value: metrics.totalPositiveResponses.toLocaleString(),
            xp: "+5 XP each",
            icon: Flame
        },
        {
            title: "POSTS",
            value: metrics.totalPostsCreated.toLocaleString(),
            xp: "+10 XP each",
            icon: Star
        },
        {
            title: "LEADS",
            value: metrics.totalLeadsGenerated.toLocaleString(),
            rate: "Leads/Post",
            rateValue: metrics.leadsPerPost.toFixed(1),
            xp: "+25 XP each",
            icon: Crown
        }
    ];

    return (
        <div>
            {/* Metrics Grid - Now above charts */}
            <div className="grid grid-cols-4 gap-6 mb-6">
                {metricsCards.map((card, index) => (
                    <MetricCard
                        key={index}
                        {...card}
                    />
                ))}
            </div>

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
                            <Line type="monotone" dataKey="postsCreated" name="Posts" stroke="#ff8888" dot={false} />
                            <Line type="monotone" dataKey="leadsGenerated" name="Leads" stroke="#ffaaaa" dot={false} />
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
        </div>
    );
}

function MetricCard({ title, value, rate, rateValue, xp, icon: Icon }: MetricCardProps) {
    return (
        <div className="bg-gray-900 border border-red-500/20 rounded-lg p-6">
            <div className="flex justify-between items-start mb-3">
                <span className="text-gray-300 text-lg">{title}</span>
                {Icon && <Icon className="text-red-500 w-6 h-6" />}
            </div>
            <div className="text-3xl font-bold mb-2 text-white">{value}</div>
            {rate && (
                <>
                    <div className="text-sm text-gray-300">{rate}</div>
                    <div className={`text-xl font-bold ${getRateColor(title, parseFloat(String(rateValue)))}`}>
                        {rateValue}
                    </div>
                </>
            )}
            <div className="text-sm text-red-500 mt-3">{xp}</div>
        </div>
    );
}

const getRateColor = (title: string, rate: number): string => {
    const value = parseFloat(String(rate).replace('%', ''));
    
    switch (title) {
        case 'OUTBOUND':
        case 'RESPONSES':
            if (value >= 5) return 'text-green-400';
            if (value >= 3) return 'text-yellow-400';
            return 'text-red-400';
            
        default:
            return 'text-white';
    }
};