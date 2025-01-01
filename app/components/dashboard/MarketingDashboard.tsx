// app/components/real-estate-dashboard/MarketingDashboard.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Crown, Flame, Star, PhoneCall, Users, DollarSign, TrendingUp } from 'lucide-react';
import MarketingTargetBarChart from './MarketingTargetBarChart';
import { TeamProjections, MetricData } from '../../lib/marketingSheets';
import { excelDateToJSDate } from './sheets';

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
    outbound_messages: number;
    positive_responses: number;
    posts_created: number;
    leads_generated: number;
}

interface ChartData {
    outbound_messages?: number;
    positive_responses?: number;
    posts_created?: number;
    leads_generated?: number;
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

interface MarketingDashboardProps {
    marketingData: any[];
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
    projections: any;
    teamMember: string;
    onMetricsCalculated?: (metrics: MarketingMetrics) => void;
}

export default function MarketingDashboard({
    marketingData,
    dateRange,
    onDateRangeChange,
    projections,
    teamMember,
    onMetricsCalculated
}: MarketingDashboardProps) {
    const [filteredMarketingData, setFilteredMarketingData] = useState<MarketingMetrics[]>([]);
    const [metrics, setMetrics] = useState<MarketingMetrics>({
        totalOutboundMessages: 0,
        totalPositiveResponses: 0,
        totalPostsCreated: 0,
        totalLeadsGenerated: 0,
        totalRevenue: 0,
        marketingXP: 0,
        responseRate: 0,
        leadsPerPost: 0,
        revenuePerClose: 0
    });
    const [timeframeMetrics, setTimeframeMetrics] = useState({
        daily: { outbound_messages: 0, positive_responses: 0, posts_created: 0, leads_generated: 0 },
        weekly: { outbound_messages: 0, positive_responses: 0, posts_created: 0, leads_generated: 0 },
        monthly: { outbound_messages: 0, positive_responses: 0, posts_created: 0, leads_generated: 0 }
    });

    console.log('[MarketingDashboard] Received projections:', projections);
    console.log('[MarketingDashboard] Selected team member:', teamMember);

    // Handle 'ALL' case by combining projections or using Chris's as default
    const teamProjections = projections?.[teamMember.toUpperCase()];

    console.log('[MarketingDashboard] Team member projections:', teamProjections);

    // Debug the data structure
    console.log('Marketing data received:', marketingData[0]);

    // Use a single filtering function
    const filterDataByDateRange = useCallback((data: any[]) => {
        if (!data?.length) return [];
        
        return data.filter(row => {
            const rowDate = row[0];  // Date is in first column
            if (!rowDate) return false;

            // Convert date string to Date object if it's a string
            const date = typeof rowDate === 'string' ? new Date(rowDate) : excelDateToJSDate(rowDate);
            const start = new Date(dateRange.startDate);
            const end = new Date(dateRange.endDate);

            return date >= start && date <= end;
        });
    }, [dateRange]);

    // Update filtered data when raw data or date range changes
    useEffect(() => {
        console.log('Raw marketing data:', marketingData);
        const filtered = filterDataByDateRange(marketingData);
        console.log('Filtered marketing data:', filtered);
        setFilteredMarketingData(filtered);
    }, [marketingData, dateRange]);

    const mapDataForLineChart = (data: any[]) => {
        return data.map(row => ({
            date: row[0],
            outbound_messages: Number(row[15]) || 0,
            positive_responses: Number(row[16]) || 0,
            posts_created: Number(row[18]) || 0,
            leads_generated: Number(row[19]) || 0,
            marketing_xp: Number(row[21]) || 0
        }));
    };

    const calculateMetrics = (data: any[]) => {
        const sortedData = [...data].sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
        
        // Since all data is within the filtered range:
        // - Daily should be most recent day
        // - Weekly should be sum of all data (since it's all within a week)
        // - Monthly same as weekly for now (since all data is within a week)
        
        const dailyData = sortedData[0] || {};
        
        // Calculate totals from all filtered data
        const totals = {
            outbound_messages: data.reduce((sum, row) => sum + (Number(row[15]) || 0), 0),
            positive_responses: data.reduce((sum, row) => sum + (Number(row[16]) || 0), 0),
            posts_created: data.reduce((sum, row) => sum + (Number(row[18]) || 0), 0),
            leads_generated: data.reduce((sum, row) => sum + (Number(row[19]) || 0), 0),
            marketing_xp: data.reduce((sum, row) => sum + (Number(row[21]) || 0), 0)
        };

        const timeframeMetrics = {
            daily: {
                outbound_messages: Number(dailyData[15]) || 0,
                positive_responses: Number(dailyData[16]) || 0,
                posts_created: Number(dailyData[18]) || 0,
                leads_generated: Number(dailyData[19]) || 0
            },
            weekly: {
                ...totals  // Use the same totals for weekly since all data is within a week
            },
            monthly: {
                ...totals  // Use the same totals for monthly since all data is within a week
            }
        };

        // For the metric cards - use the same totals
        const metricTotals = {
            totalOutboundMessages: totals.outbound_messages,
            totalPositiveResponses: totals.positive_responses,
            totalPostsCreated: totals.posts_created,
            totalLeadsGenerated: totals.leads_generated,
            totalRevenue: 0,
            marketingXP: totals.marketing_xp
        };

        // Calculate rates
        const responseRate = (metricTotals.totalPositiveResponses / metricTotals.totalOutboundMessages * 100) || 0;
        const leadsPerPost = (metricTotals.totalLeadsGenerated / metricTotals.totalPostsCreated) || 0;

        return {
            timeframeMetrics,
            metrics: {
                ...metricTotals,
                responseRate,
                leadsPerPost,
                revenuePerClose: 0
            }
        };
    };

    useEffect(() => {
        const { timeframeMetrics: newTimeframeMetrics, metrics: newMetrics } = calculateMetrics(filterDataByDateRange(marketingData));
        setMetrics(newMetrics);
        setTimeframeMetrics(newTimeframeMetrics);
        onMetricsCalculated?.(newMetrics);
    }, [marketingData, dateRange]);

    console.log('Current metrics:', metrics);
    console.log('Data being passed to LineChart:', marketingData);
    console.log('Data being passed to BarChart:', timeframeMetrics);

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
                        <LineChart data={mapDataForLineChart(marketingData)}>
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
                        data={timeframeMetrics}
                        projections={teamProjections}
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