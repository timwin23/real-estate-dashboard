"use client";

import React, { useState } from 'react';
import type { MetricData } from './sheets';

type TimeframeType = 'daily' | 'weekly' | 'monthly';

type TargetBarChartProps = {
    data: {
        [timeframe: string]: {
            [metric: string]: number;
        };
    };
    projections: MetricData | null;
};

const TargetBarChart = ({ data, projections }: TargetBarChartProps) => {
    const [timeframe, setTimeframe] = useState<TimeframeType>('daily');
    
    const getPerformanceColor = (actual: number, target: number) => {
        if (!target) return 'text-gray-400';
        const percent = (actual / target) * 100;
        if (percent >= 100) return 'bg-green-500/20 text-green-400';
        if (percent >= 90) return 'bg-yellow-500/20 text-yellow-400';
        return 'bg-red-500/20 text-red-400';
    };

    const metrics = [
        { key: 'outbound', label: 'Outbound' },
        { key: 'triage', label: 'Triage' },
        { key: 'followUps', label: 'Follow Ups' },
        { key: 'appointments', label: 'Appointments' },
        { key: 'shows', label: 'Shows' },
        { key: 'contracts', label: 'Contracts' },
        { key: 'closes', label: 'Closes' },
        { key: 'revenue', label: 'Revenue', isRevenue: true }
    ];

    const formatValue = (value: number, isRevenue?: boolean) => {
        if (isRevenue) {
            return `$${value.toLocaleString()}`;
        }
        return value.toLocaleString();
    };

    const getActualValue = (metric: string) => {
        if (metric === 'contracts') {
            return data[timeframe]?.['contractsSigned'] || 0;
        }
        return data[timeframe]?.[metric] || 0;
    };

    const getTargetValue = (metric: string) => {
        if (!projections) return 0;
        const metricKey = metric === 'contracts' ? 'contractsSigned' : metric;
        return projections[metricKey]?.[timeframe] || 0;
    };

    return (
        <div className="w-full h-full rounded-lg">
            {/* Rest of the component remains the same */}
        </div>
    );
};

export default TargetBarChart;