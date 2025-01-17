// app/components/dashboard/RealEstateDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Swords, Crown, Flame, Star, Trophy, Calendar, Users, DollarSign } from 'lucide-react';
import { 
    fetchTeamMemberData,
    filterDataByDateRange, 
    fetchProjections, 
    fetchRawData, 
    TeamMemberKey, 
    SHEET_TABS,
    excelDateToJSDate
} from './sheets';
import { fetchTeamMemberMarketingData, fetchMarketingProjections } from '../../lib/marketingSheets';
import type { TeamMemberData, TeamProjections, RawData, MetricData } from './sheets';
import TargetBarChart from './TargetBarChart';
import MarketingDashboard from './MarketingDashboard';
import type { DateRange, MarketingMetrics } from '../../types';

const logDebug = (message: string, data?: any) => {
   console.log(`[RealEstateDashboard] ${message}`, data || '');
};

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
   follow_ups?: number;
   appointments?: number;
   shows?: number;
   contracts?: number;
   closes?: number;
   revenue?: number;
};

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

const getRateColor = (title: string, rate?: number): string => {
    if (rate === undefined) return "text-white";
    const value = parseFloat(String(rate).replace('%', ''));
    const numericValue = parseFloat(String(rate).replace(/[^0-9.]/g, ''));

    switch (title) {
        case 'OUTBOUND':
            if (value >= 5) return 'text-green-400';
            if (value >= 3) return 'text-yellow-400';
            return 'text-red-400';
        case 'TRIAGE':
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
        case 'REVENUE':
            if (numericValue >= 10000) return 'text-green-400';
            if (numericValue >= 5000) return 'text-yellow-400';
            return 'text-red-400';
        default:
            return 'text-white';
    }
};

export default function RealEstateDashboard() {
   const [selectedMember, setSelectedMember] = useState<TeamMemberKey>('ALL');
   const [dashboardType, setDashboardType] = useState('sales');
   const [dateRange, setDateRange] = useState<DateRange>(() => {
       const end = new Date();
       const start = new Date();
       start.setDate(end.getDate() - 7); // Default to last 7 days
       
       return {
           startDate: start.toISOString().split('T')[0],
           endDate: end.toISOString().split('T')[0]
       };
   });
   const [data, setData] = useState<TeamMemberData[]>([]);
   const [marketingData, setMarketingData] = useState<MarketingMetrics[]>([]);
   const [personalData, setPersonalData] = useState<RawData[]>([]);
   const [loading, setLoading] = useState(true);
   const [level, setLevel] = useState(7);
   const [totalXP, setTotalXP] = useState(0);
   const [nextLevelXP] = useState(50000);
   const [currentStreak, setCurrentStreak] = useState(0);
   const [projections, setProjections] = useState<TeamProjections | null>(null);
   const [marketingProjections, setMarketingProjections] = useState<any>(null);

   const defaultMetrics: Metrics = {
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

   const defaultProjections: TeamProjections = {
    CHRIS: {
        outbound: { daily: 0, weekly: 0, monthly: 0 },
        triage: { daily: 0, weekly: 0, monthly: 0 },
        follow_ups: { daily: 0, weekly: 0, monthly: 0 },
        appointments: { daily: 0, weekly: 0, monthly: 0 },
        shows: { daily: 0, weekly: 0, monthly: 0 },
        contracts: { daily: 0, weekly: 0, monthly: 0 },
        closes: { daily: 0, weekly: 0, monthly: 0 },
        revenue: { daily: 0, weekly: 0, monthly: 0 },
        posts: { daily: 0, weekly: 0, monthly: 0 },
        leads: { daily: 0, weekly: 0, monthly: 0 },
        outbound_messages: { daily: 0, weekly: 0, monthly: 0 },
        responses: { daily: 0, weekly: 0, monthly: 0 }
    },
    ISRAEL: {
        outbound: { daily: 0, weekly: 0, monthly: 0 },
        triage: { daily: 0, weekly: 0, monthly: 0 },
        follow_ups: { daily: 0, weekly: 0, monthly: 0 },
        appointments: { daily: 0, weekly: 0, monthly: 0 },
        shows: { daily: 0, weekly: 0, monthly: 0 },
        contracts: { daily: 0, weekly: 0, monthly: 0 },
        closes: { daily: 0, weekly: 0, monthly: 0 },
        revenue: { daily: 0, weekly: 0, monthly: 0 },
        posts: { daily: 0, weekly: 0, monthly: 0 },
        leads: { daily: 0, weekly: 0, monthly: 0 },
        outbound_messages: { daily: 0, weekly: 0, monthly: 0 },
        responses: { daily: 0, weekly: 0, monthly: 0 }
    },
    IVETTE: {
        outbound: { daily: 0, weekly: 0, monthly: 0 },
        triage: { daily: 0, weekly: 0, monthly: 0 },
        follow_ups: { daily: 0, weekly: 0, monthly: 0 },
        appointments: { daily: 0, weekly: 0, monthly: 0 },
        shows: { daily: 0, weekly: 0, monthly: 0 },
        contracts: { daily: 0, weekly: 0, monthly: 0 },
        closes: { daily: 0, weekly: 0, monthly: 0 },
        revenue: { daily: 0, weekly: 0, monthly: 0 },
        posts: { daily: 0, weekly: 0, monthly: 0 },
        leads: { daily: 0, weekly: 0, monthly: 0 },
        outbound_messages: { daily: 0, weekly: 0, monthly: 0 },
        responses: { daily: 0, weekly: 0, monthly: 0 }
    },
    ALL: {
        outbound: { daily: 0, weekly: 0, monthly: 0 },
        triage: { daily: 0, weekly: 0, monthly: 0 },
        follow_ups: { daily: 0, weekly: 0, monthly: 0 },
        appointments: { daily: 0, weekly: 0, monthly: 0 },
        shows: { daily: 0, weekly: 0, monthly: 0 },
        contracts: { daily: 0, weekly: 0, monthly: 0 },
        closes: { daily: 0, weekly: 0, monthly: 0 },
        revenue: { daily: 0, weekly: 0, monthly: 0 },
        posts: { daily: 0, weekly: 0, monthly: 0 },
        leads: { daily: 0, weekly: 0, monthly: 0 },
        outbound_messages: { daily: 0, weekly: 0, monthly: 0 },
        responses: { daily: 0, weekly: 0, monthly: 0 }
    }
};

   const teamMembers: { id: TeamMemberKey; name: string }[] = [
       { id: 'ALL', name: 'All Members' },
       { id: 'CHRIS', name: 'Chris' },
       { id: 'ISRAEL', name: 'Israel' },
       { id: 'IVETTE', name: 'Ivette' },
   ];

   const calculateMetrics = (data: TeamMemberData[]): Metrics => {
       if (!data?.length) {
           console.log('[RealEstateDashboard] No data available for metrics calculation');
           return defaultMetrics;
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

   const metrics = calculateMetrics(data);

   const getCurrentXP = () => {
       if (dashboardType === 'marketing') {
           const marketingXP = marketingData.reduce((sum, entry) => sum + (Number(entry.marketing_xp) || 0), 0);
           console.log('Marketing XP:', marketingXP);
           return marketingXP;
       } else {
           const salesXP = data.reduce((sum, entry) => sum + (Number(entry.salesXP) || 0), 0);
           console.log('Sales XP:', salesXP);
           return salesXP;
       }
   };

   const calculateCurrentLevel = () => {
       const xp = dashboardType === 'marketing' ? totalXP : metrics.totalXP;
       const currentXP = getCurrentXP();
       return Math.floor(currentXP / 2000) + 1;
   };

   const progressToLevel25 = Math.min((getCurrentXP() / nextLevelXP) * 100, 100);

   const calculateStreak = (data: any[], projections: any) => {
       if (!data || data.length === 0 || !projections?.CHRIS?.outbound?.daily) return 0;

       const sortedData = [...data].sort((a, b) =>
           new Date(b.date).getTime() - new Date(a.date).getTime()
       );

       let streak = 0;
       const target = projections.CHRIS.outbound.daily;

       for (let i = 0; i < sortedData.length; i++) {
           if (sortedData[i].outbound >= target) {
               streak++;
           } else {
               break;
           }
       }

       return streak;
   };

   const formatDataForBarChart = (data: any[]) => {
       if(!data || data.length === 0) {
           logDebug('No data provided to formatDataForBarChart');
           return {daily:{}, weekly: {}, monthly:{}};
       }

       // Sort data by date in descending order
       const sortedData = [...data].sort((a, b) => 
           new Date(b.date).getTime() - new Date(a.date).getTime()
       );

       logDebug('First 3 entries of sorted data:', sortedData.slice(0, 3).map(d => ({
           date: d.date,
           outbound: d.outbound,
           triage: d.triage,
           followUps: d.followUps,
           contracts: d.contractsSigned
       })));

       // Get yesterday's data (last entry)
       const rawDailyData = sortedData[0] || {};
       logDebug('Most recent data entry:', {
           date: rawDailyData.date,
           outbound: rawDailyData.outbound,
           triage: rawDailyData.triage,
           followUps: rawDailyData.followUps,
           appointments: rawDailyData.appointments,
           shows: rawDailyData.shows,
           contractsSigned: rawDailyData.contractsSigned,
           closes: rawDailyData.closes,
           revenue: rawDailyData.revenue
       });

       // Map the daily data with correct field names
       const dailyData = {
           outbound: Number(rawDailyData.outbound) || 0,
           triage: Number(rawDailyData.triage) || 0,
           follow_ups: Number(rawDailyData.followUps) || 0,
           appointments: Number(rawDailyData.appointments) || 0,
           shows: Number(rawDailyData.shows) || 0,
           contracts: Number(rawDailyData.contractsSigned) || 0,
           closes: Number(rawDailyData.closes) || 0,
           revenue: Number(rawDailyData.revenue) || 0
       };

       // Get today's date for comparison
       const today = new Date();
       today.setHours(0, 0, 0, 0);

       // Calculate date ranges
       const sevenDaysAgo = new Date(today);
       sevenDaysAgo.setDate(today.getDate() - 7);

       const thirtyDaysAgo = new Date(today);
       thirtyDaysAgo.setDate(today.getDate() - 30);

       logDebug('Date ranges for calculations:', {
           today: today.toISOString().split('T')[0],
           sevenDaysAgo: sevenDaysAgo.toISOString().split('T')[0],
           thirtyDaysAgo: thirtyDaysAgo.toISOString().split('T')[0]
       });

       // Weekly data (last 7 days)
       const weeklyData = sortedData.reduce((acc, curr) => {
           // Convert Excel date number to JS Date
           const currDate = typeof curr.date === 'number' ? 
               excelDateToJSDate(curr.date) : 
               new Date(curr.date);
           
           currDate.setHours(0, 0, 0, 0);
           
           logDebug(`Processing date for weekly:`, {
               originalDate: curr.date,
               convertedDate: currDate.toISOString(),
               isAfterSevenDays: currDate >= sevenDaysAgo,
               isBeforeToday: currDate <= today
           });
           
           if (currDate >= sevenDaysAgo && currDate <= today) {
               logDebug(`Adding to weekly totals:`, {
                   date: currDate.toISOString(),
                   data: {
                       outbound: Number(curr.outbound) || 0,
                       triage: Number(curr.triage) || 0,
                       followUps: Number(curr.followUps) || 0,
                       contracts: Number(curr.contractsSigned) || 0
                   }
               });
               
               acc.outbound = (acc.outbound || 0) + (Number(curr.outbound) || 0);
               acc.triage = (acc.triage || 0) + (Number(curr.triage) || 0);
               acc.follow_ups = (acc.follow_ups || 0) + (Number(curr.followUps) || 0);
               acc.appointments = (acc.appointments || 0) + (Number(curr.appointments) || 0);
               acc.shows = (acc.shows || 0) + (Number(curr.shows) || 0);
               acc.contracts = (acc.contracts || 0) + (Number(curr.contractsSigned) || 0);
               acc.closes = (acc.closes || 0) + (Number(curr.closes) || 0);
               acc.revenue = (acc.revenue || 0) + (Number(curr.revenue) || 0);
           }
           return acc;
       }, {
           outbound: 0,
           triage: 0,
           follow_ups: 0,
           appointments: 0,
           shows: 0,
           contracts: 0,
           closes: 0,
           revenue: 0
       } as ChartData);

       // Add similar logging for monthly data
       logDebug('Weekly data calculation complete:', {
           totalEntries: sortedData.length,
           entriesInRange: sortedData.filter(d => {
               const date = new Date(d.date);
               return date >= sevenDaysAgo && date <= today;
           }).length,
           finalTotals: weeklyData
       });

       // Monthly data (last 30 days)
       const monthlyData = sortedData.reduce((acc, curr) => {
           const currDate = typeof curr.date === 'number' ? 
               excelDateToJSDate(curr.date) : 
               new Date(curr.date);
           
           currDate.setHours(0, 0, 0, 0);
           
           if (currDate >= thirtyDaysAgo && currDate <= today) {
               acc.outbound = (acc.outbound || 0) + (Number(curr.outbound) || 0);
               acc.triage = (acc.triage || 0) + (Number(curr.triage) || 0);
               acc.follow_ups = (acc.follow_ups || 0) + (Number(curr.followUps) || 0);
               acc.appointments = (acc.appointments || 0) + (Number(curr.appointments) || 0);
               acc.shows = (acc.shows || 0) + (Number(curr.shows) || 0);
               acc.contracts = (acc.contracts || 0) + (Number(curr.contractsSigned) || 0);
               acc.closes = (acc.closes || 0) + (Number(curr.closes) || 0);
               acc.revenue = (acc.revenue || 0) + (Number(curr.revenue) || 0);
           }
           return acc;
       }, {
           outbound: 0,
           triage: 0,
           follow_ups: 0,
           appointments: 0,
           shows: 0,
           contracts: 0,
           closes: 0,
           revenue: 0
       } as ChartData);

       logDebug('Final data for all timeframes:', {
           daily: dailyData,
           weekly: weeklyData,
           monthly: monthlyData
       });

       return {
           daily: dailyData,
           weekly: weeklyData,
           monthly: monthlyData
       };
   };

   const calculateMarketingMetrics = () => {
       if (!marketingData || marketingData.length === 0) {
           return {
               totalPosts: 0,
               totalLeads: 0,
               totalOutboundMessages: 0,
               totalResponses: 0,
               totalXP: 0
           };
       }

       return marketingData.reduce((acc, curr: MarketingMetrics) => ({
           totalPosts: acc.totalPosts + (Number(curr.posts_created) || 0),
           totalLeads: acc.totalLeads + (Number(curr.leads_generated) || 0),
           totalOutboundMessages: acc.totalOutboundMessages + (Number(curr.outbound_messages) || 0),
           totalResponses: acc.totalResponses + (Number(curr.positive_responses) || 0),
           totalXP: acc.totalXP + (Number(curr.marketing_xp) || 0)
       }), {
           totalPosts: 0,
           totalLeads: 0,
           totalOutboundMessages: 0,
           totalResponses: 0,
           totalXP: 0
       });
   };

   const loadData = async () => {
       try {
           setLoading(true);
           
           // Fetch raw data
           const rawData = await fetchTeamMemberData(selectedMember);
           const marketingRawData = await fetchTeamMemberMarketingData(selectedMember);
           
           // Fetch projections
           const projectionsData = await fetchProjections();
           const marketingProjectionsData = await fetchMarketingProjections();
           
           // Filter data by selected date range
           console.log('Date range being used:', dateRange);
           const filteredData = filterDataByDateRange(rawData, dateRange.startDate, dateRange.endDate);
           
           // Add debug logs
           console.log('Raw sales data:', rawData);
           console.log('Raw marketing data:', marketingRawData);
           
           setData(filteredData);
           setMarketingData(marketingRawData);  // Don't filter marketing data yet
           setProjections(projectionsData);
           setMarketingProjections(marketingProjectionsData);
           
       } catch (error) {
           console.error('Error loading data:', error);
       } finally {
           setLoading(false);
       }
   };

   // Add useEffect to reload data when date range changes
   useEffect(() => {
       loadData();
   }, [selectedMember, dateRange.startDate, dateRange.endDate]);

   useEffect(() => {
       setTotalXP(getCurrentXP());
       setLevel(calculateCurrentLevel());
   }, [data, marketingData, dashboardType, selectedMember]);

   const marketingMetrics = calculateMarketingMetrics();

   // Add a handler for marketing metrics
   const handleMarketingMetrics = (metrics: MarketingMetrics) => {
       if (dashboardType === 'marketing') {
           const totalMarketingXP = metrics.marketing_xp || 0;
           console.log('Setting marketing XP:', totalMarketingXP);
           setTotalXP(totalMarketingXP);
       }
   };

   if (loading) {
       return <div className="min-h-screen bg-gray-950 text-white p-6">Loading...</div>;
   }

   logDebug('Current state before render:', {
       selectedMember,
       dashboardType,
       dateRange,
       metrics,
       data: data?.length,
       marketingData: marketingData?.length
   });

   return (
       <div className="min-h-screen bg-gray-950 text-white p-4">
           <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-4">
                   <select 
                       value={selectedMember} 
                       onChange={(e) => setSelectedMember(e.target.value as TeamMemberKey)}
                       className="bg-gray-800 text-white p-2 rounded"
                   >
                       <option value="ALL">All Members</option>
                       <option value="CHRIS">Chris</option>
                       <option value="ISRAEL">Israel</option>
                       <option value="IVETTE">Ivette</option>
                   </select>

                   <div className="flex gap-2 items-center">
                       <input
                           type="date"
                           value={typeof dateRange.startDate === 'string' ? dateRange.startDate : dateRange.startDate.toISOString().split('T')[0]}
                           onChange={(e) => setDateRange(prev => ({
                               ...prev,
                               startDate: e.target.value
                           }))}
                           className="bg-gray-800 text-white rounded px-3 py-2"
                       />
                       <span className="text-white">to</span>
                       <input
                           type="date"
                           value={typeof dateRange.endDate === 'string' ? dateRange.endDate : dateRange.endDate.toISOString().split('T')[0]}
                           onChange={(e) => setDateRange(prev => ({
                               ...prev,
                               endDate: e.target.value
                           }))}
                           className="bg-gray-800 text-white rounded px-3 py-2"
                       />
                   </div>
               </div>

               <div className="flex gap-2">
                   <button
                       onClick={() => setDashboardType('sales')}
                       className={`px-4 py-2 rounded ${
                           dashboardType === 'sales' 
                               ? 'bg-red-500 text-white' 
                               : 'bg-gray-800 text-gray-300'
                       }`}
                   >
                       Sales
                   </button>
                   <button
                       onClick={() => setDashboardType('marketing')}
                       className={`px-4 py-2 rounded ${
                           dashboardType === 'marketing' 
                               ? 'bg-red-500 text-white' 
                               : 'bg-gray-800 text-gray-300'
                       }`}
                   >
                       Marketing
                   </button>
               </div>
           </div>

           {/* Level Progress */}
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

           {/* Dashboard Content */}
           {dashboardType === 'sales' ? (
               <>
                   {/* Sales Metrics Grid */}
                   <div className="grid grid-cols-5 gap-4 mb-6">
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
                           rate="Set Rate"
                           rateValue={`${((metrics.totalAppointments / metrics.totalTriage * 100) || 0).toFixed(1)}%`}
                           xp="+10 XP each"
                           icon={Swords}
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
                           rateValue={`$${(metrics.totalRevenue / metrics.totalCloses || 0).toLocaleString()}`}
                           icon={DollarSign}
                       />
                   </div>

                   {/* Sales Charts */}
                   <div className="grid grid-cols-2 gap-4 mb-6">
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
                                   <Line type="monotone" dataKey="appointments" name="Appointments" stroke="#ff8888" dot={false} />
                                   <Line type="monotone" dataKey="contractsSigned" name="Contracts" stroke="#ffaaaa" dot={false} />
                               </LineChart>
                           </ResponsiveContainer>
                       </div>

                       <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px]">
                           <TargetBarChart
                               data={formatDataForBarChart(data)}
                               projections={projections?.[selectedMember] || null}
                               metrics={[
                                   { key: 'outbound', label: 'Outbound' },
                                   { key: 'triage', label: 'Triage' },
                                   { key: 'follow_ups', label: 'Follow Ups' },
                                   { key: 'appointments', label: 'Appointments' },
                                   { key: 'shows', label: 'Shows' },
                                   { key: 'contracts', label: 'Contracts' },
                                   { key: 'closes', label: 'Closes' },
                                   { key: 'revenue', label: 'Revenue', isRevenue: true }
                               ]}
                           />
                       </div>
                   </div>
               </>
           ) : (
               <MarketingDashboard
                   marketingData={marketingData}
                   dateRange={dateRange}
                   onDateRangeChange={(range) => setDateRange({
                       startDate: typeof range.startDate === 'string' ? range.startDate : range.startDate.toISOString().split('T')[0],
                       endDate: typeof range.endDate === 'string' ? range.endDate : range.endDate.toISOString().split('T')[0]
                   })}
                   projections={marketingProjections}
                   teamMember={selectedMember}
                   onMetricsCalculated={handleMarketingMetrics}
               />
           )}
       </div>
   );
}
