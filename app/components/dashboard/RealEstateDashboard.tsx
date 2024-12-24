// app/components/dashboard/RealEstateDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Swords, Crown, Flame, Star, Trophy, PhoneCall, Calendar, Users, DollarSign } from 'lucide-react';
import { fetchTeamMemberData, filterDataByDateRange, fetchProjections, fetchRawData, TeamMemberKey, SHEET_TABS } from './sheets';
import type { TeamMemberData, TeamProjections, RawData } from './sheets';
import TargetBarChart from './TargetBarChart';
import MarketingDashboard from './MarketingDashboard';
import PersonalAchievements from './PersonalAchievements';

// Console logging utility for debugging
const logDebug = (message: string, data?: any) => {
    console.log(`[RealEstateDashboard] ${message}`, data || '');
};

// Types and Interfaces
type MetricCardProps = {
    title: string;
    value: string | number;
    rate?: string;
    rateValue?: string | number;
    xp?: string;
    icon: React.ComponentType<any>;
};

type Metrics = {
    totalOutbound: number;
    totalTriage: number;
    totalFollowUps: number;
    totalAppointments: number;
    totalShows: number;
    totalContracts: number;
    totalCloses: number;
    totalRevenue: number;
    totalXP: number;
};

type ChartData = {
    outbound?: number;
    triage?: number;
    followUps?: number;
    appointments?: number;
    shows?: number;
    contracts?: number;
    closes?: number;
};

// Utility function for metric colors
const getRateColor = (title: string, rate?: number): string => {
    if (rate === undefined) return "text-white";
    const value = parseFloat(String(rate).replace('%', ''));

    switch (title) {
        case 'OUTBOUND':
            if (value >= 5) return 'text-green-400';
            if (value >= 3) return 'text-yellow-400';
            return 'text-red-400';
        case 'TRIAGE':
            if (value >= 50) return 'text-green-400';
            if (value >= 30) return 'text-yellow-400';
            return 'text-red-400';
        case 'FOLLOW UPS':
            if (value >= 50) return 'text-green-400';
            if (value >= 30) return 'text-yellow-400';
            return 'text-red-400';
        case 'APPOINTMENTS':
            if (value >= 80) return 'text-green-400';
            if (value >= 70) return 'text-yellow-400';
            return 'text-red-400';
        case 'CONTRACTS':
            if (value >= 50) return 'text-green-400';
            if (value >= 30) return 'text-yellow-400';
            return 'text-red-400';
        case 'CLOSES':
            if (value >= 30) return 'text-green-400';
            if (value >= 20) return 'text-yellow-400';
            return 'text-red-400';
        default:
            return 'text-white';
    }
};

// Reusable MetricCard component
function MetricCard({ title, value, rate, rateValue, xp, icon: Icon }: MetricCardProps) {
    return (
        <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-300">{title}</span>
                {Icon && <Icon className="text-red-500" />}
            </div>
            <div className="text-2xl font-bold mb-1 text-white">{value}</div>
            {rate && <div className="text-sm text-gray-300">{rate}</div>}
            {rateValue && <div className={`text-lg font-bold ${getRateColor(title, rateValue ? parseFloat(String(rateValue)) : undefined)}`}>
                {rateValue}
            </div>}
            {xp && <div className="text-xs text-red-500 mt-2">{xp}</div>}
        </div>
    );
}

// Main Dashboard Component
export default function RealEstateDashboard() {
    // State Management
    const [selectedMember, setSelectedMember] = useState<TeamMemberKey>('ALL');
    const [dashboardType, setDashboardType] = useState('sales');
    const [dateRange, setDateRange] = useState('7');
    const [data, setData] = useState<TeamMemberData[]>([]);
    const [marketingData, setMarketingData] = useState<any[]>([]);
    const [personalData, setPersonalData] = useState<RawData[]>([]);
    const [loading, setLoading] = useState(true);
    const [level, setLevel] = useState(7);
    const [totalXP, setTotalXP] = useState(0);
    const [nextLevelXP] = useState(50000);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [projections, setProjections] = useState<TeamProjections | null>(null);
    const [marketingProjections, setMarketingProjections] = useState<any>(null);

    const teamMembers: { id: TeamMemberKey; name: string }[] = [
        { id: 'ALL', name: 'All Members' },
        { id: 'CHRIS', name: 'Chris Analysis' },
        { id: 'ISRAEL', name: 'Israel Analysis' },
        { id: 'IVETTE', name: 'Ivette Analysis' },
    ];

    // Get XP based on dashboard type
    const getCurrentXP = () => {
        logDebug('Calculating XP for dashboard type:', dashboardType);
        if (dashboardType === 'sales') {
            return data.reduce((acc, curr) => acc + (Number(curr.salesXP) || 0), 0);
        } else if (dashboardType === 'marketing') {
            return marketingData.reduce((acc, curr) => acc + (Number(curr.marketingXP) || 0), 0);
        }
        return 0; // No personal XP for team members
    };

    const calculateCurrentLevel = () => {
        const currentXP = getCurrentXP();
        return Math.floor(currentXP / 2000) + 1;
    };

    const progressToLevel25 = Math.min((getCurrentXP() / nextLevelXP) * 100, 100);

    const calculateStreak = (data: any[], projections: any) => {
        if (!data || data.length === 0 || !projections?.chris?.outbound?.daily) return 0;

        const sortedData = [...data].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        let streak = 0;
        const target = projections.chris.outbound.daily;

        for (let i = 0; i < sortedData.length; i++) {
            if (sortedData[i].outbound >= target) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const calculateMetrics = (): Metrics => {
        if (!data || data.length === 0) {
            logDebug('No data available for metrics calculation');
            return {
                totalOutbound: 0,
                totalTriage: 0,
                totalFollowUps: 0,
                totalAppointments: 0,
                totalShows: 0,
                totalContracts: 0,
                totalCloses: 0,
                totalRevenue: 0,
                totalXP: 0
            };
        }

        const metrics = data.reduce((acc, curr) => ({
            totalOutbound: acc.totalOutbound + (Number(curr.outbound) || 0),
            totalTriage: acc.totalTriage + (Number(curr.triage) || 0),
            totalFollowUps: acc.totalFollowUps + (Number(curr.followUps) || 0),
            totalAppointments: acc.totalAppointments + (Number(curr.appointments) || 0),
            totalShows: acc.totalShows + (Number(curr.shows) || 0),
            totalContracts: acc.totalContracts + (Number(curr.contractsSigned) || 0),
            totalCloses: acc.totalCloses + (Number(curr.closes) || 0),
            totalRevenue: acc.totalRevenue + (Number(curr.revenue) || 0),
            totalXP: acc.totalXP + (Number(curr.salesXP) || 0)
        }), {
            totalOutbound: 0,
            totalTriage: 0,
            totalFollowUps: 0,
            totalAppointments: 0,
            totalShows: 0,
            totalContracts: 0,
            totalCloses: 0,
            totalRevenue: 0,
            totalXP: 0
        });

        logDebug('Calculated metrics:', metrics);
        return metrics;
    };

    const formatDataForBarChart = (data: any[]) => {
        if(!data || data.length === 0) return {daily:{}, weekly: {}, monthly:{}};

        const dailyData = data[data.length - 1] || {};

        const weeklyData = data.slice(-7).reduce((acc, curr) => ({
            outbound: (acc.outbound || 0) + (Number(curr.outbound) || 0),
            triage: (acc.triage || 0) + (Number(curr.triage) || 0),
            followUps: (acc.followUps || 0) + (Number(curr.followUps) || 0),
            appointments: (acc.appointments || 0) + (Number(curr.appointments) || 0),
            shows: (acc.shows || 0) + (Number(curr.shows) || 0),
            contracts: (acc.contracts || 0) + (Number(curr.contractsSigned) || 0),
            closes: (acc.closes || 0) + (Number(curr.closes) || 0),
        }), {} as ChartData);

        const monthlyData = data.slice(-30).reduce((acc, curr) => ({
            outbound: (acc.outbound || 0) + (Number(curr.outbound) || 0),
            triage: (acc.triage || 0) + (Number(curr.triage) || 0),
            followUps: (acc.followUps || 0) + (Number(curr.followUps) || 0),
            appointments: (acc.appointments || 0) + (Number(curr.appointments) || 0),
            shows: (acc.shows || 0) + (Number(curr.shows) || 0),
            contracts: (acc.contracts || 0) + (Number(curr.contractsSigned) || 0),
            closes: (acc.closes || 0) + (Number(curr.closes) || 0),
        }), {} as ChartData);

        return {
            daily: dailyData,
            weekly: weeklyData,
            monthly: monthlyData
        };
    };

    useEffect(() => {
        async function loadData() {
            try {
                logDebug('Starting data load for member:', selectedMember);
                setLoading(true);
                let salesData: TeamMemberData[] = [],
                    mktgData: any[] = [],
                    pData: RawData[] = [];

                if (selectedMember === 'ALL') {
                    logDebug('Fetching data for all members...');
                    const [chrisData, israelData, ivetteData] = await Promise.all([
                        fetchTeamMemberData('CHRIS'),
                        fetchTeamMemberData('ISRAEL'),
                        fetchTeamMemberData('IVETTE')
                    ]);
                    salesData = [...chrisData, ...israelData, ...ivetteData];
                    // For marketing data, fetch all and combine
                    mktgData = await fetchRawData();
                    pData = await fetchRawData();

                } else {
                    logDebug(`Fetching data for single member: ${selectedMember}`);
                    salesData = await fetchTeamMemberData(selectedMember);
                    mktgData = await fetchRawData();
                    pData = await fetchRawData();
                }

                const [projectionsData, mktgProjections] = await Promise.all([
                    fetchProjections(),
                    fetchMarketingProjections()
                ]);

                logDebug('Projections fetched:', { projectionsData, mktgProjections });

                setProjections(projectionsData);
                setMarketingProjections(mktgProjections);

                if (dateRange === 'ALL') {
                    setData(salesData);
                    setMarketingData(mktgData);
                    setPersonalData(pData);
                } else {
                    const today = new Date();
                    const startDate = new Date();
                    startDate.setDate(today.getDate() - parseInt(dateRange));

                    const filteredSalesData = filterDataByDateRange(salesData, startDate.toISOString(), today.toISOString());
                    const filteredMktgData = filterDataByDateRange(mktgData, startDate.toISOString(), today.toISOString());
                    const filteredPersonalData = filterDataByDateRange(pData, startDate.toISOString(), today.toISOString());

                    setData(filteredSalesData);
                    setMarketingData(filteredMktgData);
                    setPersonalData(filteredPersonalData);

                    const streak = calculateStreak(filteredSalesData,
                        selectedMember === 'ALL' ? projectionsData?.chris : projectionsData?.[selectedMember]);
                    setCurrentStreak(streak);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [dateRange, selectedMember]);

    useEffect(() => {
        setTotalXP(getCurrentXP());
        setLevel(calculateCurrentLevel());
    }, [data, marketingData, dashboardType, selectedMember]);

    const metrics = calculateMetrics();

    if (loading) {
        return <div className="min-h-screen bg-gray-950 text-white p-6">Loading...</div>;
    }

    logDebug('Current state before render:', {
        selectedMember,
        dashboardType,
        dateRange,
        metrics,
        data: data?.length,
        marketingData: marketingData?.length,
        personalData: personalData?.length
    });

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                    <h1 className="text-2xl font-bold text-red-500">REAL ESTATE COMMAND CENTER</h1>
                    <div className="bg-red-900/30 px-2 py-1 rounded-md border border-red-500/30">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-red-500" />
                            <span>STREAK: {currentStreak} DAYS</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <select
                        className="bg-gray-900 border border-red-500/30 rounded-md p-2 text-white"
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value as TeamMemberKey)}
                    >
                        {teamMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>
                    <select
                        className="bg-gray-900 border border-red-500/30 rounded-md p-2 text-white"
                        value={dashboardType}
                        onChange={(e) => setDashboardType(e.target.value)}
                    >
                        <option value="sales">Sales</option>
                        <option value="marketing">Marketing</option>
                        <option value="personal">Personal</option>
                    </select>
                    <select
                        className="bg-gray-900 border border-red-500/30 rounded-md p-2 text-white"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="7">7 Days</option>
                        <option value="30">30 Days</option>
                        <option value="90">90 Days</option>
                        <option value="ALL">All Time</option>
                    </select>
                </div>
            </div>

            {/* Level Progress - Only show for sales and marketing dashboards */}
            {dashboardType !== 'personal' && (
                <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xl text-red-500">Progress to Level 25</div>
                        <div className="flex items-center gap-2 text-white">
                            <span className="text-red-500 font-bold">Level {calculateCurrentLevel()}</span>
                            <span>|</span>
                            <span>{getCurrentXP().toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-800 h-4 rounded-full">
                        <div
                            className="bg-red-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressToLevel25}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Dashboard Content */}
            {dashboardType === 'sales' ? (
                <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-6 gap-4 mb-6">
                        <MetricCard
                            title="OUTBOUND"
                            value={metrics.totalOutbound.toLocaleString()}
                            rate="Conv. Rate"
                            rateValue={`${((metrics.totalTriage / metrics.totalOutbound * 100) || 0).toFixed(1)}%`}
                            xp="+1 XP each"
                            icon={Target}
                        />
                        <MetricCard
                            title="TRIAGE"
                            value={metrics.totalTriage.toLocaleString()}
                            rate="Follow Up Rate"
                             rateValue={`${((metrics.totalFollowUps / metrics.totalTriage * 100) || 0).toFixed(1)}%`}
                            xp="+10 XP each"
                            icon={Swords}
                        />
                        <MetricCard
                            title="FOLLOW UPS"
                            value={metrics.totalFollowUps.toLocaleString()}
                            rate="Set Rate"
                             rateValue={`${((metrics.totalAppointments / metrics.totalFollowUps * 100) || 0).toFixed(1)}%`}
                            xp="+15 XP each"
                            icon={PhoneCall}
                        />
                        <MetricCard
                            title="APPOINTMENTS"
                             value={metrics.totalAppointments.toLocaleString()}
                            rate="Show Rate"
                            rateValue={`${((metrics.totalShows / metrics.totalAppointments * 100) || 0).toFixed(1)}%`}
                            xp="+25 XP each"
                            icon={Calendar}
                        />
                        <MetricCard
                            title="CONTRACTS"
                            value={metrics.totalContracts.toLocaleString()}
                            rate="Close Rate"
                             rateValue={`${((metrics.totalCloses / metrics.totalContracts * 100) || 0).toFixed(1)}%`}
                            xp="+50 XP each"
                            icon={Trophy}
                        />
                        <MetricCard
                            title="REVENUE"
                            value={`$${metrics.totalRevenue.toLocaleString()}`}
                            rate="Per Close"
                             rateValue={`$${Math.round(metrics.totalRevenue / metrics.totalCloses || 0).toLocaleString()}`}
                             xp={`Total XP: ${metrics.totalXP.toLocaleString()}`}
                            icon={DollarSign}
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Line Chart */}
                        <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
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
                                    <Line type="monotone" dataKey="outbound" name="Outbound" stroke="#ff0000" dot={false} />
                                    <Line type="monotone" dataKey="triage" name="Triage" stroke="#ff4444" dot={false} />
                                     <Line type="monotone" dataKey="followUps" name="Follow Ups" stroke="#ff6666" dot={false} />
                                    <Line type="monotone" dataKey="appointments" name="Appointments" stroke="#ff8888" dot={false} />
                                     <Line type="monotone" dataKey="contractsSigned" name="Contracts" stroke="#ffaaaa" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Chart */}
                         <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
                           <TargetBarChart
                            data={formatDataForBarChart(data)}
                            projections={projections ? projections[selectedMember === 'all' ? 'chris' : selectedMember] : null}
                           />
                        </div>
                    </div>
                </>
            ) : dashboardType === 'marketing' ? (
                <MarketingDashboard
                    marketingData={marketingData}
                     dateRange={dateRange}
                    onDateRangeChange={(range) => setDateRange(range)}
                    projections={marketingProjections}
                    teamMember={selectedMember}
                />
            ) : (
                <PersonalDashboard
                   data={personalData}
                   dateRange={dateRange}
                   onDateRangeChange={(range) => setDateRange(range)}
                   salesData={data}
                   marketingData={marketingData}
                   projections={projections}
                />
            )}
        </div>
    );
}