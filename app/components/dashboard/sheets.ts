// app/components/dashboard/sheets.ts

export const SHEET_TABS = {
  CHRIS: 'Chris Analysis',
  ISRAEL: 'Israel Analysis',
  IVETTE: 'Ivette Analysis',
  PROJECTIONS: 'Projections',
  RAW_DATA: 'Raw Data',
  ACHIEVEMENT_LIBRARY: 'Achievement Library',
  GOALS: 'Goals & Achievements'
} as const;

export type TeamMemberKey = keyof typeof SHEET_TABS;

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
  salesXP: number;
}

export interface MetricData {
  outbound: { daily: number; weekly: number; monthly: number };
  triage: { daily: number; weekly: number; monthly: number };
  followUps: { daily: number; weekly: number; monthly: number };
  appointments: { daily: number; weekly: number; monthly: number };
  shows: { daily: number; weekly: number; monthly: number };
  contracts: { daily: number; weekly: number; monthly: number };
  closes: { daily: number; weekly: number; monthly: number };
  revenue: { daily: number; weekly: number; monthly: number };
}

export interface TeamProjections {
  [key: string]: MetricData;
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
  energy: number;
  confidence: number;
  operatingPotential: number;
  reflection: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = '1tliv1aCy4VJEDvwwUFkNa34eSL_h-uB4gaBUnUhtE4';

async function fetchSheetRange(range: string) {
  try {
    console.log(`[sheets.ts] Fetching range: ${range}`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${range}: ${response.status}`);
    }

    const data = await response.json();
    if (!data.values?.length) {
      console.warn(`[sheets.ts] No data found in range: ${range}`);
      return [];
    }

    return data.values;
  } catch (error) {
    console.error(`[sheets.ts] Error fetching ${range}:`, error);
    return [];
  }
}

export async function fetchTeamMemberData(memberName: TeamMemberKey): Promise<TeamMemberData[]> {
  const range = `${SHEET_TABS[memberName]}!A2:X`;
  const data = await fetchSheetRange(range);

  return data.map((row: any[]) => ({
    date: row[0] || '',
    outbound: Number(row[1]) || 0,
    triage: Number(row[2]) || 0,
    triageRate: Number(row[3]) || 0,
    followUps: Number(row[4]) || 0,
    appointments: Number(row[5]) || 0,
    setRate: Number(row[6]) || 0,
    shows: Number(row[7]) || 0,
    showRate: Number(row[8]) || 0,
    contractsSigned: Number(row[9]) || 0,
    contractRate: Number(row[10]) || 0,
    closes: Number(row[11]) || 0,
    closeRate: Number(row[12]) || 0,
    revenue: Number(row[13]) || 0,
    revenuePerClose: Number(row[14]) || 0,
    salesXP: Number(row[15]) || 0
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
    energy: Number(row[11]) || 0,
    confidence: Number(row[12]) || 0,
    operatingPotential: Number(row[13]) || 0,
    reflection: row[14] || ''
  }));
}

export async function fetchProjections(): Promise<TeamProjections> {
  const data = await fetchSheetRange(`${SHEET_TABS.PROJECTIONS}!A2:J15`);
  
  return {
    CHRIS: parseProjections(data, [1, 2, 3]),
    ISRAEL: parseProjections(data, [4, 5, 6]),
    IVETTE: parseProjections(data, [7, 8, 9]),
    ALL: parseProjections(data, [1, 2, 3]) // Default to Chris's projections for ALL
  };
}

function parseProjections(data: any[], cols: number[]): MetricData {
  return {
    outbound: getMetricData(data[0] || [], cols),
    triage: getMetricData(data[1] || [], cols),
    followUps: getMetricData(data[2] || [], cols),
    appointments: getMetricData(data[3] || [], cols),
    shows: getMetricData(data[4] || [], cols),
    contracts: getMetricData(data[5] || [], cols),
    closes: getMetricData(data[6] || [], cols),
    revenue: getMetricData(data[7] || [], cols)
  };
}

function getMetricData(row: any[], cols: number[]) {
  return {
    daily: Number(row[cols[0]]) || 0,
    weekly: Number(row[cols[1]]) || 0,
    monthly: Number(row[cols[2]]) || 0
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