// app/components/dashboard/sheets.ts
function safeRate(value: any): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

// Add these type definitions at the top of sheets.ts
export type TierType = 'bronze' | 'silver' | 'gold' | 'none';
export type CategoryType = 'sales' | 'marketing';

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
  type: 'goal' | 'achievement';
  status: 'active' | 'completed' | 'failed';
  startDate: string;
  endDate: string | null;
  progress: number;
}

export interface AchievementsData {
  library: Achievement[];
  goalsAndAchievements: Goal[];
  activeGoal?: Goal | undefined;
  completedAchievements: Goal[];
}

// Team member data structure
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

// Raw data from form submissions
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

// Projection structure for metrics
export interface TeamProjection {
  [key: string]: {
      daily: number;
      weekly: number;
      monthly: number;
  };
}

// Type-safe team member keys
export type TeamMemberKey = 'chris' | 'israel' | 'ivette' | string;

// Team projections with index signature and specific members
export interface TeamProjections {
  [key: string]: TeamProjection;
  chris: TeamProjection;
  israel: TeamProjection;
  ivette: TeamProjection;
}

const SPREADSHEET_ID = "1tliv1aCy4VJEDvwwUFkNa34eSL_h-uB4gaBUnUhtE4";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;

// Helper function to fetch data from any sheet range
async function fetchSheetRange(range: string) {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;
    console.log(`[sheets.ts] fetchSheetRange - Fetching data from URL: ${url}`);
      const response = await fetch(url);
        if (!response.ok) {
           throw new Error(`[sheets.ts] fetchSheetRange - Failed to fetch data for range ${range}: Status ${response.status}`);
       }
    const data = await response.json();
      if (!data.values) {
          console.error(`[sheets.ts] No data values returned from range ${range}`);
          return [];
      }
    
    return data.values;
  } catch (error) {
    console.error(`[sheets.ts] Error fetching range ${range}:`, error);
    return [];
  }
}

// Fetch data for a specific team member
export async function fetchTeamMemberData(memberName: string): Promise<TeamMemberData[]> {
 const range = `${memberName} Analysis!A2:X`;
  console.log(`[sheets.ts] fetchTeamMemberData - Fetching data for member: ${memberName}, range: ${range}`);
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

// Fetch raw form submission data
export async function fetchRawData(): Promise<RawData[]> {
const range = 'Raw Data!A2:S';
console.log(`[sheets.ts] fetchRawData - Fetching raw data with range: ${range}`);
const data = await fetchSheetRange(range);

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

// Fetch projections for all team members
export async function fetchProjections(): Promise<TeamProjections> {
const range = 'Projections!A2:J15';
 console.log(`[sheets.ts] fetchProjections - Fetching projections data with range: ${range}`);
const data = await fetchSheetRange(range);

const projections: TeamProjections = {
  chris: {},
  israel: {},
  ivette: {}
};

data.forEach((row: any[]) => {
  const metric = row[0].toLowerCase().replace(/ /g, '_');
  
  // Chris projections (columns B,C,D)
  projections.chris[metric] = {
    daily: Number(row[1]) || 0,
    weekly: Number(row[2]) || 0,
    monthly: Number(row[3]) || 0
  };

  // Israel projections (columns E,F,G)
  projections.israel[metric] = {
    daily: Number(row[4]) || 0,
    weekly: Number(row[5]) || 0,
    monthly: Number(row[6]) || 0
  };

  // Ivette projections (columns H,I,J)
  projections.ivette[metric] = {
    daily: Number(row[7]) || 0,
    weekly: Number(row[8]) || 0,
    monthly: Number(row[9]) || 0
  };
});

return projections;
}

// Add this function to sheets.ts before filterDataByDateRange
export async function fetchAchievements(): Promise<AchievementsData> {
  const achievementsRange = 'Achievement Library!A2:I';
  const goalsRange = 'Goals & Achievements!A2:M';
  
   console.log(`[sheets.ts] fetchAchievements - Fetching achievements with ranges: ${achievementsRange} and ${goalsRange}`);
  const [achievementsData, goalsData] = await Promise.all([
      fetchSheetRange(achievementsRange),
      fetchSheetRange(goalsRange)
  ]);

     const library: Achievement[] = achievementsData.map((row: any[]) => ({
         id: row[0] || '',
        title: row[1] || '',
        category: row[2] as CategoryType || 'sales',
        tier: row[3] as TierType || 'none',
        description: row[4] || '',
         target: Number(row[5]) || 0,
          trait: row[6] || '',
         icon: row[7] || '',
         isSecret: row[8] === 'TRUE'
    }));

    const goals: Goal[] = goalsData.map((row: any[]) => ({
         id: row[0] || '',
         type: row[1] as 'goal' | 'achievement',
        category: row[2] as CategoryType || 'sales',
          tier: row[3] as TierType || 'none',
         title: row[4] || '',
         description: row[5] || '',
        target: Number(row[6]) || 0,
       trait: row[7] || '',
         status: row[8] as 'active' | 'completed' | 'failed',
        startDate: row[9] || '',
          endDate: row[10] || null,
        progress: Number(row[11]) || 0,
         isSecret: row[12] === 'TRUE'
      }));

  return {
    library,
      goalsAndAchievements: goals,
     activeGoal: goals.find(goal => goal.status === 'active') || undefined,
      completedAchievements: goals.filter(goal => goal.status === 'completed')
  };
}

export async function fetchGoals() {
  const range = 'Goals & Achievements!A2:M';
   console.log(`[sheets.ts] fetchGoals - Fetching goals with range: ${range}`);
      return await fetchSheetRange(range);
}

export function filterDataByDateRange<T extends { date: string }>(data: T[], startDate: string, endDate: string): T[] {
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