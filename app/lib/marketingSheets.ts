// app/lib/marketingSheets.ts

const SHEET_TABS = {
  CHRIS: 'Chris Analysis',
  ISRAEL: 'Israel Analysis',
  IVETTE: 'Ivette Analysis',
  PROJECTIONS: 'Projections'
};

const SPREADSHEET_ID = "1tliv1aCy4VJEDvwwUFkNa34eSEL_h-uB4gaBUnUhtE4";
const API_KEY = "AIzaSyC18sJQ9feNkZcEiIlwxWI3K1xx6j5zz-8";

function safeRate(numerator: any, denominator: any): number {
  const num = parseFloat(numerator);
  const denom = parseFloat(denominator);
  if (isNaN(num) || isNaN(denom) || denom === 0) return 0;
  const rate = (num / denom) * 100;
  return rate > 100 ? 100 : Math.round(rate * 10) / 10;
}

interface MarketingMetrics {
  date: string;
  outboundMessages: number;
  positiveResponses: number;
  responseRate: number;
  postsCreated: number;
  leadsGenerated: number;
  leadsPerPost: number;
  marketingXP: number;
}

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
    console.error(`[marketingSheets] Error fetching ${range}:`, error);
    return [];
  }
}

type SheetTabKey = keyof typeof SHEET_TABS;

async function listSheets() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('[marketingSheets] Available sheets:', 
      data.sheets?.map((s: any) => s.properties?.title)
    );
  } catch (error) {
    console.error('[marketingSheets] Error listing sheets:', error);
  }
}

export async function fetchTeamMemberMarketingData(memberName: 'chris' | 'israel' | 'ivette'): Promise<MarketingMetrics[]> {
  const upperName = memberName.toUpperCase() as SheetTabKey;
  const sheetName = SHEET_TABS[upperName];
  
  console.log(`[marketingSheets] Fetching data for member: ${memberName}, sheet: ${sheetName}`);
  
  const data = await fetchSheetData(`${sheetName}!A2:V`);
  
  return data.map((row: any[]) => {
    const outboundMessages = Number(row[15]) || 0;
    const positiveResponses = Number(row[16]) || 0;
    const postsCreated = Number(row[18]) || 0;
    const leadsGenerated = Number(row[19]) || 0;
    const marketingXP = Number(row[20]) || 0;

    return {
      date: row[0],
      outboundMessages,
      positiveResponses,
      responseRate: safeRate(positiveResponses, outboundMessages),
      postsCreated,
      leadsGenerated,
      leadsPerPost: safeRate(leadsGenerated, postsCreated),
      marketingXP
    };
  });
}

interface TeamMemberProjections {
  outbound: Projection;
  posts: Projection;
  leads: Projection;
  responses: Projection;
}

interface Projection {
  daily: number;
  weekly: number;
  monthly: number;
}

interface TeamProjections {
  chris: TeamMemberProjections;
  israel: TeamMemberProjections;
  ivette: TeamMemberProjections;
}

export async function fetchMarketingProjections(): Promise<TeamProjections> {
  const data = await fetchSheetData(`${SHEET_TABS.PROJECTIONS}!B10:J13`);
  
  const metrics: (keyof TeamMemberProjections)[] = ['outbound', 'posts', 'leads', 'responses'];
  const members = ['chris', 'israel', 'ivette'] as const;
  
  const projections: TeamProjections = {
    chris: createEmptyProjections(),
    israel: createEmptyProjections(),
    ivette: createEmptyProjections()
  };

  data.forEach((row: any[], index: number) => {
    const metricIndex = Math.floor(index / 4);
    const metric = metrics[metricIndex];
    if (!metric) return;

    members.forEach((member, i) => {
      const baseCol = i * 3;
      projections[member][metric] = {
        daily: Number(row[baseCol + 1]) || 0,
        weekly: Number(row[baseCol + 2]) || 0,
        monthly: Number(row[baseCol + 3]) || 0
      };
    });
  });

  return projections;
}

function createEmptyProjections(): TeamMemberProjections {
  return {
    outbound: { daily: 0, weekly: 0, monthly: 0 },
    posts: { daily: 0, weekly: 0, monthly: 0 },
    leads: { daily: 0, weekly: 0, monthly: 0 },
    responses: { daily: 0, weekly: 0, monthly: 0 }
  };
}

export interface MarketingData {
    date: string;
    outbound_messages: number;
    positive_responses: number;
    posts_created: number;
    leads_generated: number;
    marketing_xp: number;
}