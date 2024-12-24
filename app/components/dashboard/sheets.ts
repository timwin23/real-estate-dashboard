// app/components/dashboard/sheets.ts

export {}; // This empty export makes the file a module

const SHEET_TABS = {
  CHRIS: 'Chris Analysis',
  ISRAEL: 'Israel Analysis',
  IVETTE: 'Ivette Analysis',
  PROJECTIONS: 'Projections',
  RAW_DATA: 'Raw Data',
  ACHIEVEMENT_LIBRARY: 'Achievement Library',
  GOALS_ACHIEVEMENTS: 'Goals & Achievements'
};

const SPREADSHEET_ID = "1tliv1aCy4VJEDvwwUFkNa34eSL_h-uB4gaBUnUhtE4";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;

export type TeamMemberKey = keyof typeof SHEET_TABS;

// Utility function to calculate rates safely
function safeRate(value: any): number {
  return isNaN(Number(value)) ? 0 : Number(value);
}

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

export interface TeamProjection {
  [key: string]: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface TeamProjections {
  [key: string]: TeamProjection;
  chris: TeamProjection;
  israel: TeamProjection;
  ivette: TeamProjection;
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

// Simplified range fetcher
async function fetchSheetRange(range: string): Promise<any[]> {
  try {
    console.log(`[sheets.ts] Fetching data from range: ${range}`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`[sheets.ts] Error fetching ${range}:`, error);
    return [];
  }
}

// Fetch data for a specific team member
export async function fetchTeamMemberData(memberName: TeamMemberKey): Promise<TeamMemberData[]> {
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
    salesXP: Number(row[22]) || 0,
  }));
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
    const data = await fetchSheetRange(`${SHEET_TABS.PROJECTIONS}!A2:J13`);

    const projections: TeamProjections = {
        chris: {},
        israel: {},
        ivette: {}
    };

    const metrics = ['outbound', 'triage', 'follow_ups', 'appointments', 'shows', 'contracts', 'revenue', 'posts', 'leads', 'outbound_messages', 'responses'];

    data.forEach((row: any[], index: number) => {
        const metric = metrics[index];
        if (!metric) return;

        const teamMembers = ['chris', 'israel', 'ivette'];
        const columns = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ];

        teamMembers.forEach((member, i) => {
            projections[member][metric] = {
                daily: Number(row[columns[i][0]]) || 0,
                weekly: Number(row[columns[i][1]]) || 0,
                monthly: Number(row[columns[i][2]]) || 0
            };
        });
    });

    return projections;
}

export async function fetchAchievements(): Promise<AchievementsData> {
  const [achievementsData, goalsData] = await Promise.all([
    fetchSheetRange(`${SHEET_TABS.ACHIEVEMENT_LIBRARY}!A2:I`),
    fetchSheetRange(`${SHEET_TABS.GOALS}!A2:M`)
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
  
  return data.filter(row => {
    try {
      const rowDate = new Date(row.date);
      return rowDate >= start && rowDate <= end;
    } catch {
      return false;
    }
  });
}