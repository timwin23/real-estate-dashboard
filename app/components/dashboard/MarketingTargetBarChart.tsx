// app/components/real-estate-dashboard/MarketingTargetBarChart.tsx
"use client";

import React, { useState } from 'react';

type TimeframeType = 'daily' | 'weekly' | 'monthly';

// Add missing interfaces
interface MetricsFormat {
    [key: string]: number;
    outbound_messages: number;
    positive_responses: number;
    posts_created: number;
    leads_generated: number;
}

interface Projection {
    daily: number;
    weekly: number;
    monthly: number;
}

interface BarChartProps {
    data: {
        daily: MetricsFormat;
        weekly: MetricsFormat;
        monthly: MetricsFormat;
    };
    projections: {
        outbound_messages: Projection;
        positive_responses: Projection;
        posts_created: Projection;
        leads_generated: Projection;
    };
}

export default function MarketingTargetBarChart({ data, projections }: BarChartProps) {
    const [timeframe, setTimeframe] = useState<TimeframeType>('daily');

    console.log('[MarketingBarChart] Data structure:', {
        data: data,
        projections: projections,
        outbound: projections?.outbound_messages  // This is undefined
    });

    console.log('[MarketingBarChart] Received projections:', projections);
    console.log('[MarketingBarChart] Received data:', data);

    const getPerformanceColor = (actual: number, target: number) => {
        if (!target) return 'text-gray-400';
        const percent = (actual / target) * 100;
        if (percent >= 100) return 'bg-green-500/20 text-green-400';
        if (percent >= 90) return 'bg-yellow-500/20 text-yellow-400';
        return 'bg-red-500/20 text-red-400';
    };

    const metrics = [
        { key: 'outbound_messages', label: 'Outbound Messages', row: 'Outbound' },
        { key: 'positive_responses', label: 'Responses', row: 'Responses' },
        { key: 'posts_created', label: 'Posts', row: 'Posts' },
        { key: 'leads_generated', label: 'Leads', row: 'Leads' }
    ];

    const getTargetValue = (projections: any, metric: string, timeframe: TimeframeType): number => {
        if (!projections) return 0;
        return projections[metric]?.[timeframe] || 0;
    };

    return (
        <div className="w-full h-full rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-200">Performance vs Targets</h3>
                <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as TimeframeType)}
                    className="bg-gray-800 text-white rounded-md px-3 py-1.5 text-sm border border-gray-700"
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>

            {/* Table */}
            <div className="w-full border border-gray-800 rounded-lg overflow-hidden h-[300px]">
                <div className="grid grid-cols-3 text-sm h-full overflow-y-auto">
                    {/* Table Header */}
                    <div className="bg-gray-800/50 px-4 py-2 font-medium text-gray-400">METRIC</div>
                    <div className="bg-gray-800/50 px-4 py-2 font-medium text-gray-400 text-right">TARGET</div>
                    <div className="bg-gray-800/50 px-4 py-2 font-medium text-gray-400 text-right">ACTUAL</div>

                    {/* Table Body */}
                    {metrics.map((metric, idx) => {
                        const actual = data[timeframe]?.[metric.key] || 0;
                        const target = getTargetValue(projections, metric.key, timeframe);
                        console.log(`[MarketingBarChart] ${metric.label} projection:`, 
                            projections[metric.key]?.[timeframe]);

                        return (
                            <React.Fragment key={metric.key}>
                                <div className={`px-4 py-3 text-gray-200 font-medium ${idx % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                                    {metric.label}
                                </div>
                                <div className={`px-4 py-3 text-right text-gray-400 ${idx % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                                    {target.toLocaleString()}
                                </div>
                                <div className={`px-4 py-3 text-right font-medium ${getPerformanceColor(actual, target)} rounded-sm ${idx % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                                    {actual.toLocaleString()}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}