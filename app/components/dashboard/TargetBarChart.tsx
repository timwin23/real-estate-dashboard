"use client";

import React, { useState } from 'react';

type TimeframeType = 'daily' | 'weekly' | 'monthly';

type MetricData = {
    [key: string]: {
        daily: number;
        weekly: number;
        monthly: number;
    };
};

type MetricKeyType = keyof MetricData;

type ChartProps = {
    data: any[];
    projections: MetricData | null;
};

const TargetBarChart = ({ data, projections }: ChartProps) => {
    const [timeframe, setTimeframe] = useState<TimeframeType>('daily');

    const getPerformanceColor = (actual: number, target: number) => {
        if (!target) return 'text-gray-400';
        const percent = (actual / target) * 100;
        if (percent >= 100) return 'bg-green-500/20 text-green-400';
        if (percent >= 90) return 'bg-yellow-500/20 text-yellow-400';
        return 'bg-red-500/20 text-red-400';
    };

    const metrics = [
        { key: 'outbound' as MetricKeyType, label: 'Outbound' },
        { key: 'triage' as MetricKeyType, label: 'Triage' },
        { key: 'follow_ups' as MetricKeyType, label: 'Follow Ups' },
        { key: 'appointments' as MetricKeyType, label: 'Appointments' },
        { key: 'shows' as MetricKeyType, label: 'Shows' },
        { key: 'contracts' as MetricKeyType, label: 'Contracts' },
        { key: 'closes' as MetricKeyType, label: 'Closes' },
        { key: 'revenue' as MetricKeyType, label: 'Revenue', isRevenue: true }
    ];

    const formatValue = (value: number, isRevenue?: boolean) => {
        if (isRevenue) {
            return `$${value.toLocaleString()}`;
        }
        return value.toLocaleString();
    };

    const getActualValue = (data: any[], metric: MetricKeyType, timeframe: TimeframeType): number => {
        if (!data || data.length === 0) return 0;

        let relevantData: any[] = [];
        if (timeframe === 'daily') {
            relevantData = data.slice(-1); // Get the last day
        } else if (timeframe === 'weekly') {
            relevantData = data.slice(-7); // Get the last 7 days
        } else if (timeframe === 'monthly') {
            relevantData = data.slice(-30); // Get the last 30 days
        }

        return relevantData.reduce((sum, day) => sum + (day[metric] || 0), 0);
    };

    const getTargetValue = (projections: MetricData | null, metric: MetricKeyType, timeframe: TimeframeType): number => {
        if (!projections || !projections[metric]) return 0;
        return projections[metric][timeframe] || 0;
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
                        const actual = getActualValue(data, metric.key, timeframe);
                        const target = getTargetValue(projections, metric.key, timeframe);

                        return (
                            <React.Fragment key={metric.key}>
                                <div className={`px-4 py-3 text-gray-200 font-medium ${idx % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                                    {metric.label}
                                </div>
                                <div className={`px-4 py-3 text-right text-gray-400 ${idx % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                                    {formatValue(target, metric.isRevenue)}
                                </div>
                                <div className={`px-4 py-3 text-right font-medium ${getPerformanceColor(actual, target)} rounded-sm ${idx % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                                    {formatValue(actual, metric.isRevenue)}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TargetBarChart;