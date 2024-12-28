// app/components/dashboard/sheets.ts

// Change const to export const for SHEET_TABS
export const SHEET_TABS = {
  CHRIS: 'Chris Analysis',
  ISRAEL: 'Israel Analysis',
  IVETTE: 'Ivette Analysis',
  PROJECTIONS: 'Projections',
  RAW_DATA: 'Raw Data',
  ACHIEVEMENT_LIBRARY: 'Achievement Library',
  GOALS_ACHIEVEMENTS: 'Goals & Achievements',
  ALL: 'ALL'
} as const;

// Keep private for internal use
const SPREADSHEET_ID = "1tliv1aCy4VJEDvwwUFkNa34eSEL_h-uB4gaBUnUhtE4";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;

// Export type for SHEET_TABS keys
export type TeamMemberKey = keyof typeof SHEET_TABS;

// Rest of your existing types and exports
export type TierType = 'bronze' | 'silver' | 'gold' | 'none';
export type CategoryType = 'sales' | 'marketing';
export type MetricKey = 
  | 'outbound' 
  | 'triage' 
  | 'follow_ups' 
  | 'appointments' 
  | 'shows' 
  | 'contracts' 
  | 'closes' 
  | 'revenue'
  | 'posts'
  | 'leads'
  | 'outbound_messages'
  | 'responses';

// Rest of the file remains the same...

// Interfaces
export interface TeamMemberData {
    date: string;
    outbound: number;
    triage: number;
    triageRate: number;
    followUps: number;
    appointments: number;
    setRate: number;
    shows: number;
    showRate: number;
    contractsSigned: number;
    contractRate: number;
    closes: number;
    closeRate: number;
    revenue: number;
    revenuePerClose: number;
    outboundMessages: number;
    positiveResponses: number;
    responseRate: number;
    postsCreated: number;
    leadsGenerated: number;
    leadsPerPost: number;
    marketingXP: number;
    salesXP: number;
}

export interface RawData {
    timestamp: string;
    teamMember: string;
    date: string;
    outbound: number;
    triage: number;
    followUps: number;
    appointments: number;
    shows: number;
    contractsSigned: number;
    closes: number;
    revenue: number;
    postsCreated: number;
    leadsGenerated: number;
    outboundMessages: number;
    positiveResponses: number;
    energy: number;
    confidence: number;
    operatingPotential: number;
    reflection: string;
}

export interface MetricData {
    [key: string]: { daily: number; weekly: number; monthly: number };
    outbound: { daily: number; weekly: number; monthly: number };
    triage: { daily: number; weekly: number; monthly: number };
    follow_ups: { daily: number; weekly: number; monthly: number };
    appointments: { daily: number; weekly: number; monthly: number };
    shows: { daily: number; weekly: number; monthly: number };
    contracts: { daily: number; weekly: number; monthly: number };
    closes: { daily: number; weekly: number; monthly: number };
    revenue: { daily: number; weekly: number; monthly: number };
    posts: { daily: number; weekly: number; monthly: number };
    leads: { daily: number; weekly: number; monthly: number };
    outbound_messages: { daily: number; weekly: number; monthly: number };
    responses: { daily: number; weekly: number; monthly: number };
}

export interface TeamProjections {
    [key: string]: MetricData;
}

export interface Achievement {
    id: string;
    title: string;
    category: CategoryType;
    tier: TierType;
    description: string;
    target: number;
    trait: string;
    icon: string;
    isSecret: boolean;
}

export interface Goal extends Achievement {
    progress: number;
}

export interface AchievementsData {
    activeGoal: Goal | null;
    completedAchievements: Goal[];
}

// Utility function to calculate rates safely
const safeRate = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

// Helper function to handle errors
function handleSheetError(error: any, range: string) {
    console.error(`[sheets.ts] Error fetching range ${range}:`, error);
    return []; // Return empty array as fallback
}

// Fetch data from Google Sheet
async function fetchSheetRange(range: string): Promise<any[]> {
    try {
        console.log(`[sheets.ts] Fetching data from range: ${range}`);
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data = await response.json();
        if (!data.values?.length) {
            console.log(`[sheets.ts] No data found in range: ${range}`);
            return [];
        }
        return data.values;
    } catch (error) {
        return handleSheetError(error, range);
    }
}

// Fetch data for a specific team member
export async function fetchTeamMemberData(memberName: TeamMemberKey): Promise<TeamMemberData[]> {
    if (memberName === "ALL") {
        return [];
    }

    const range = `${SHEET_TABS[memberName]}!A2:X`;
    const data = await fetchSheetRange(range);

    return data.map((row: any[]) => ({
        date: row[0] || '',
        outbound: Number(row[1]) || 0,
        triage: Number(row[2]) || 0,
        triageRate: safeRate(row[3]),
        followUps: Number(row[4]) || 0,
        appointments: Number(row[5]) || 0,
        setRate: safeRate(row[6]),
        shows: Number(row[7]) || 0,
        showRate: safeRate(row[8]),
        contractsSigned: Number(row[9]) || 0,
        contractRate: safeRate(row[10]),
        closes: Number(row[11]) || 0,
        closeRate: safeRate(row[12]),
        revenue: Number(row[13]) || 0,
        revenuePerClose: Number(row[14]) || 0,
        outboundMessages: Number(row[15]) || 0,
        positiveResponses: Number(row[16]) || 0,
        responseRate: safeRate(row[17]),
        postsCreated: Number(row[18]) || 0,
        leadsGenerated: Number(row[19]) || 0,
        leadsPerPost: safeRate(row[20]),
        marketingXP: Number(row[21]) || 0,
        salesXP: Number(row[22]) || 0
    }));
}

// Fetch raw data
export async function fetchRawData(): Promise<RawData[]> {
    const data = await fetchSheetRange(`${SHEET_TABS.RAW_DATA}!A2:S`);

    return data.map((row: any[]) => ({
        timestamp: row[0] || '',
        teamMember: row[1] || '',
        date: row[2] || '',
        outbound: Number(row[3]) || 0,
        triage: Number(row[4]) || 0,
        followUps: Number(row[5]) || 0,
        appointments: Number(row[6]) || 0,
        shows: Number(row[7]) || 0,
        contractsSigned: Number(row[8]) || 0,
        closes: Number(row[9]) || 0,
        revenue: Number(row[10]) || 0,
        postsCreated: Number(row[11]) || 0,
        leadsGenerated: Number(row[12]) || 0,
        outboundMessages: Number(row[13]) || 0,
        positiveResponses: Number(row[14]) || 0,
        energy: Number(row[15]) || 0,
        confidence: Number(row[16]) || 0,
        operatingPotential: Number(row[17]) || 0,
        reflection: row[18] || ''
    }));
}

// Fetch projections with correct structure and member names
export async function fetchProjections(): Promise<TeamProjections> {
    const data = await fetchSheetRange(`${SHEET_TABS.PROJECTIONS}!A2:J13`);

    const projections: TeamProjections = {
        CHRIS: {} as MetricData,
        ISRAEL: {} as MetricData,
        IVETTE: {} as MetricData,
        ALL: {} as MetricData
    };

    const metrics: MetricKey[] = [
        'outbound', 'triage', 'follow_ups', 'appointments', 'shows',
        'contracts', 'closes', 'revenue', 'posts', 'leads',
        'outbound_messages', 'responses'
    ];

    data.forEach((row: any[], index: number) => {
        const metric = metrics[index];
        if (!metric) return;

        ['CHRIS', 'ISRAEL', 'IVETTE'].forEach((member, i) => {
            const colStart = i * 3;

            projections[member][metric] = {
                daily: Number(row[colStart + 1]) || 0,
                weekly: Number(row[colStart + 2]) || 0,
                monthly: Number(row[colStart + 3]) || 0
            };
        });

        // Use Chris's projections for ALL
        projections.ALL[metric] = { ...projections.CHRIS[metric] };
    });

    return projections;
}

// Fetch achievements
export async function fetchAchievements(): Promise<AchievementsData> {
    const [achievementsData, goalsData] = await Promise.all([
        fetchSheetRange(`${SHEET_TABS.ACHIEVEMENT_LIBRARY}!A2:I`),
        fetchSheetRange(`${SHEET_TABS.GOALS_ACHIEVEMENTS}!A2:M`)
    ]);

    const goals: Goal[] = goalsData.map((row: any[]) => ({
        id: row[0] || '',
        title: row[1] || '',
        category: row[2] as CategoryType || 'sales',
        tier: row[3] as TierType || 'none',
        description: row[4] || '',
        target: Number(row[5]) || 0,
        trait: row[6] || '',
        icon: row[7] || '',
        isSecret: Boolean(row[8]),
        progress: Number(row[9]) || 0
    }));

    return {
        activeGoal: goals.find(goal => goal.progress < goal.target) || null,
        completedAchievements: goals.filter(goal => goal.progress >= goal.target)
    };
}

// Filter data by date range
export function filterDataByDateRange<T extends { date: string }>(
    data: T[],
    startDate: string,
    endDate: string
): T[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return data.filter(row => {
        try {
            const rowDate = new Date(row.date);
            return rowDate >= start && rowDate <= end;
        } catch {
            return false;
        }
    });
}