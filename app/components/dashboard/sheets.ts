export const SHEET_TABS = {
    ALL: 'ALL',
    CHRIS: 'Chris Analysis',
    ISRAEL: 'Israel Analysis',
    IVETTE: 'Ivette Analysis',
    PROJECTIONS: 'Projections',
    RAW_DATA: 'Raw Data',
    ACHIEVEMENT_LIBRARY: 'Achievement Library',
    GOALS_ACHIEVEMENTS: 'Goals & Achievements'
} as const;

const SPREADSHEET_ID = "1tliv1aCy4VJEDvwwUFkNa34eSEL_h-uB4gaBUnUhtE4";
const API_KEY = "AIzaSyC18sJQ9feNkZcEiIlwxWI3K1xx6j5zz-8";

// Add this at the top of sheets.ts with other utility functions
const logDebug = (message: string, data?: any) => {
    console.log(`[sheets.ts] ${message}`, data || '');
};

// Add this near the top with other utility functions
async function fetchSheetData(range: string): Promise<any[]> {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        return handleSheetError(error, range);
    }
}

// Export types
export type TeamMemberKey = keyof typeof SHEET_TABS;
export type CategoryType = 'sales' | 'marketing';
export type TierType = 'bronze' | 'silver' | 'gold' | 'none';
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
    CHRIS: MetricData;
    ISRAEL: MetricData;
    IVETTE: MetricData;
    ALL: MetricData;
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

// Add these types at the top with other types
export type MarketingData = {
    date: string | number;
    outboundMessages: number;
    positiveResponses: number;
    postsCreated: number;
    leadsGenerated: number;
    marketingXP: number;
};

// Utility Functions
function safeRate(value: any): number {
    return isNaN(Number(value)) ? 0 : Number(value);
}

function handleSheetError(error: any, range: string) {
    console.error(`[sheets.ts] Error fetching range ${range}:`, error);
    return [];
}

async function fetchSheetRange(range: string): Promise<any[]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;
    
    try {
        console.log(`[sheets.ts] Fetching data from range: ${range}`);
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[sheets.ts] Error response:`, errorText);
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

export async function fetchTeamMemberData(member: TeamMemberKey): Promise<TeamMemberData[]> {
    try {
        if (member === 'ALL') {
            // Fetch all members' data
            const [chrisData, israelData, ivetteData] = await Promise.all([
                fetchRawData('Chris Analysis'),
                fetchRawData('Israel Analysis'), 
                fetchRawData('Ivette Analysis')
            ]);
            return [...chrisData, ...israelData, ...ivetteData];
        }

        // Fetch individual member data
        const sheetName = `${member} Analysis`;
        return await fetchRawData(sheetName);
    } catch (error) {
        console.error('Error fetching team member data:', error);
        return [];
    }
}

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

export async function fetchProjections(): Promise<TeamProjections> {
    try {
        const range = `${SHEET_TABS.PROJECTIONS}!A2:J13`;
        const data = await fetchSheetRange(range);
        
        logDebug('Raw projections data rows:', data);
        
        const projections: TeamProjections = {
            CHRIS: {} as MetricData,
            ISRAEL: {} as MetricData,
            IVETTE: {} as MetricData,
            ALL: {} as MetricData
        };

        const metricsMap: Record<number, MetricKey> = {
            1: 'outbound',         // Row 1 is Outbound
            2: 'triage',          // Row 2 is Triage
            3: 'follow_ups',      // Row 3 is Follow Ups
            4: 'appointments',    // Row 4 is Appointments
            5: 'shows',          // Row 5 is Shows
            6: 'contracts',      // Row 6 is Contracts
            7: 'revenue',        // Row 7 is Revenue
            8: 'posts',          // Row 8 is Posts
            9: 'leads',          // Row 9 is Leads
            10: 'outbound_messages', // Row 10 is Outbound
            11: 'responses'      // Row 11 is Responses
        };

        data.forEach((row: any[], index: number) => {
            const metric = metricsMap[index] as MetricKey;
            if (!metric) return;

            // CHRIS: B-D (indices 1,2,3)
            projections.CHRIS[metric] = {
                daily: Number(row[1]) || 0,   // B column
                weekly: Number(row[2]) || 0,   // C column
                monthly: Number(row[3]) || 0    // D column
            };

            // ISRAEL: E-G (indices 4,5,6)
            projections.ISRAEL[metric] = {
                daily: Number(row[4]) || 0,   // E column
                weekly: Number(row[5]) || 0,   // F column
                monthly: Number(row[6]) || 0    // G column
            };

            // IVETTE: H-J (indices 7,8,9)
            projections.IVETTE[metric] = {
                daily: Number(row[7]) || 0,   // H column
                weekly: Number(row[8]) || 0,   // I column
                monthly: Number(row[9]) || 0    // J column
            };

            // ALL: Sum of individual targets
            projections.ALL[metric] = {
                daily: projections.CHRIS[metric].daily + projections.ISRAEL[metric].daily + projections.IVETTE[metric].daily,
                weekly: projections.CHRIS[metric].weekly + projections.ISRAEL[metric].weekly + projections.IVETTE[metric].weekly,
                monthly: projections.CHRIS[metric].monthly + projections.ISRAEL[metric].monthly + projections.IVETTE[metric].monthly
            };
        });

        logDebug('Projections fetched:', projections);
        return projections;
    } catch (error) {
        console.error('Error fetching projections:', error);
        return defaultProjections;
    }
}

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

export function filterDataByDateRange<T extends { date: string }>(
    data: T[],
    startDate: string,
    endDate: string
): T[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Add debug logging
    console.log('Filtering date range:', {
        startDate,
        endDate,
        firstRowDate: data[0]?.date,
        dateFormat: data[0]?.date ? typeof data[0].date : 'no data'
    });
    
    return data.filter(row => {
        try {
            // Google Sheets might be returning a serial number for dates
            // Let's check what we're actually getting
            console.log('Row date:', {
                raw: row.date,
                type: typeof row.date
            });
            
            let rowDate: Date;
            
            if (typeof row.date === 'number') {
                // If it's a number, it's likely a Excel/Sheets serial number
                // Convert Excel/Sheets date serial number to JS Date
                rowDate = new Date((row.date - 25569) * 86400 * 1000);
            } else {
                // If it's a string, parse it normally
                const [year, month, day] = String(row.date).split('-').map(Number);
                rowDate = new Date(year, month - 1, day);
            }
            
            // Set hours to 0 for consistent date comparison
            rowDate.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            
            return rowDate >= start && rowDate <= end;
        } catch (error) {
            console.error('Error parsing date:', error, row.date);
            return false;
        }
    });
}

// Add this function with your other fetch functions
export const fetchMarketingData = async (member: TeamMemberKey): Promise<MarketingData[]> => {
    try {
        logDebug(`Fetching marketing data for member: ${member}`);
        
        if (member === 'ALL') {
            const promises = Object.values(SHEET_TABS)
                .filter(tab => tab.includes('Analysis'))
                .map(tab => fetchSheetData(`${tab}!A2:X`));
            
            const results = await Promise.all(promises);
            
            logDebug('Raw marketing data:', {
                firstRow: results[0]?.[0],
                totalRows: results.flat().length
            });
            
            const mappedData = results.flat().map(row => {
                const mapped = {
                    date: row[0],
                    outboundMessages: Number(row[12]) || 0,
                    positiveResponses: Number(row[13]) || 0,
                    postsCreated: Number(row[8]) || 0,
                    leadsGenerated: Number(row[9]) || 0,
                    marketingXP: Number(row[16]) || 0
                };
                
                logDebug('Mapping row:', {
                    original: row,
                    mapped: mapped
                });
                
                return mapped;
            });
            
            return mappedData;
        } else {
            const tab = SHEET_TABS[member];
            const data = await fetchSheetData(`${tab}!A2:X`);
            
            return data.map(row => ({
                date: row[0],
                outboundMessages: Number(row[12]) || 0,
                positiveResponses: Number(row[13]) || 0,
                postsCreated: Number(row[8]) || 0,
                leadsGenerated: Number(row[9]) || 0,
                marketingXP: Number(row[16]) || 0
            }));
        }
    } catch (error) {
        console.error('Error fetching marketing data:', error);
        return [];
    }
};