// app/lib/sheets.ts

function safeRate(value: any): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

// Team member data structure
interface TeamMemberData {
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
interface RawData {
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

// Projections structure for each team member
interface TeamProjection {
  [key: string]: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface TeamProjections {
  chris: TeamProjection;
  israel: TeamProjection;
  ivette: TeamProjection;
}

// Achievement structure
interface Achievement {
  id: string;
  title: string;
  category: string;
  tier: number;
  description: string;
  target: number;
  trait: string;
  icon: string;
  isSecret: boolean;
}

const SPREADSHEET_ID = "1tliv1aCy4VJEDvwwUFkNa34eSL_h-uB4gaBUnUhtE4";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;

// Helper function to fetch data from any sheet range
async function fetchSheetRange(range: string) {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.values) {
      console.error(`No data values returned from range ${range}`);
      return [];
    }
    
    return data.values;
  } catch (error) {
    console.error(`Error fetching range ${range}:`, error);
    return [];
  }
}

// Fetch data for a specific team member
export async function fetchTeamMemberData(memberName: string): Promise<TeamMemberData[]> {
  const range = `${memberName} Analysis!A2:X`;
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

// Fetch achievements library
export async function fetchAchievements(): Promise<Achievement[]> {
  const range = 'Achievement Library!A2:I';
  const data = await fetchSheetRange(range);
  
  return data.map((row: any[]) => ({
    id: row[0] || '',
    title: row[1] || '',
    category: row[2] || '',
    tier: Number(row[3]) || 0,
    description: row[4] || '',
    target: Number(row[5]) || 0,
    trait: row[6] || '',
    icon: row[7] || '',
    isSecret: Boolean(row[8])
  }));
}

// Fetch goals and achievements progress
export async function fetchGoals() {
  const range = 'Goals & Achievements!A2:M';
  return await fetchSheetRange(range);
}

// Helper function to filter data by date range
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