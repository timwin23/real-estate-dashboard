// app/components/real-estate-dashboard/MarketingDashboard.tsx
"use client";

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Crown, Flame, Star, PhoneCall, Users, DollarSign, TrendingUp } from 'lucide-react';
import MarketingTargetBarChart from './MarketingTargetBarChart';
import { TeamProjections, MetricData } from '../../lib/marketingSheets';

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

const defaultProjections: TeamProjections = {
    CHRIS: {
        outbound_messages: { daily: 0, weekly: 0, monthly: 0 },
        positive_responses: { daily: 0, weekly: 0, monthly: 0 },
        posts_created: { daily: 0, weekly: 0, monthly: 0 },
        leads_generated: { daily: 0, weekly: 0, monthly: 0 }
    },
    ISRAEL: {
        outbound_messages: { daily: 0, weekly: 0, monthly: 0 },
        positive_responses: { daily: 0, weekly: 0, monthly: 0 },
        posts_created: { daily: 0, weekly: 0, monthly: 0 },
        leads_generated: { daily: 0, weekly: 0, monthly: 0 }
    },
    IVETTE: {
        outbound_messages: { daily: 0, weekly: 0, monthly: 0 },
        positive_responses: { daily: 0, weekly: 0, monthly: 0 },
        posts_created: { daily: 0, weekly: 0, monthly: 0 },
        leads_generated: { daily: 0, weekly: 0, monthly: 0 }
    },
    ALL: {
        outbound_messages: { daily: 0, weekly: 0, monthly: 0 },
        positive_responses: { daily: 0, weekly: 0, monthly: 0 },
        posts_created: { daily: 0, weekly: 0, monthly: 0 },
        leads_generated: { daily: 0, weekly: 0, monthly: 0 }
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
    const [selectedRange, setSelectedRange] = useState<keyof typeof DATE_RANGES>('WEEK');

    console.log('[MarketingDashboard] Received projections:', projections);
    console.log('[MarketingDashboard] Selected team member:', teamMember);

    // Handle 'ALL' case by combining projections or using Chris's as default
    const teamProjections = teamMember === 'ALL' 
        ? projections?.chris // Use Chris's projections as default for ALL
        : projections?.[teamMember.toLowerCase()];

    console.log('[MarketingDashboard] Team member projections:', teamProjections);

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
            totalOutboundMessages: acc.totalOutboundMessages + (curr.outbound_messages || 0),
            totalPositiveResponses: acc.totalPositiveResponses + (curr.positive_responses || 0),
            totalPostsCreated: acc.totalPostsCreated + (curr.posts_created || 0),
            totalLeadsGenerated: acc.totalLeadsGenerated + (curr.leads_generated || 0),
            marketingXP: acc.marketingXP + (curr.marketing_xp || 0)
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
            <div className="grid grid-cols-4 gap-4 mb-6">
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
                            <Line type="monotone" dataKey="outbound_messages" name="Outbound" stroke="#ff0000" dot={false} />
                            <Line type="monotone" dataKey="positive_responses" name="Responses" stroke="#ff4444" dot={false} />
                            <Line type="monotone" dataKey="posts_created" name="Posts" stroke="#ff8888" dot={false} />
                            <Line type="monotone" dataKey="leads_generated" name="Leads" stroke="#ffaaaa" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
                    <MarketingTargetBarChart
                        data={formatDataForBarChart(marketingData)}
                        projections={projections ? (projections[teamMember.toUpperCase() as keyof TeamProjections] as MetricData) : defaultProjections[teamMember.toUpperCase() as keyof TeamProjections]}
                    />
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, rate, rateValue, xp, icon: Icon }: MetricCardProps) {
    return (
        <div className="bg-gray-900 border border-red-500/20 rounded-lg p-5">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-300">{title}</span>
                {Icon && <Icon className="text-red-500 w-5 h-5" />}
            </div>
            <div className="text-2xl font-bold mb-1 text-white">{value}</div>
            {rate && (
                <>
                    <div className="text-sm text-gray-300">{rate}</div>
                    <div className={`text-lg font-bold ${getRateColor(title, parseFloat(String(rateValue)))}`}>
                        {rateValue}
                    </div>
                </>
            )}
            <div className="text-xs text-red-500 mt-2">{xp}</div>
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