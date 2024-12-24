// app/lib/marketingSheets.ts

const SHEET_TABS = {
  CHRIS: 'Chris',
  ISRAEL: 'Israel',
  IVETTE: 'Ivette',
  PROJECTIONS: 'Projections'
};

const SPREADSHEET_ID = "1tliv1aCy4VJEDvwwUFkNa34eSL_h-uB4gaBUnUhtE4";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;

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

async function fetchSheetRange(range: string) {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    if (!data.values?.length) {
      console.log(`[marketingSheets] No data found in range: ${range}`);
      return [];
    }
    return data.values;
  } catch (error) {
    console.error(`[marketingSheets] Error fetching ${range}:`, error);
    return [];
  }
}

type SheetTabKey = keyof typeof SHEET_TABS;

export async function fetchTeamMemberMarketingData(memberName: 'chris' | 'israel' | 'ivette'): Promise<MarketingMetrics[]> {
  const upperName = memberName.toUpperCase() as SheetTabKey;
  const data = await fetchSheetRange(`${SHEET_TABS[upperName]}!A2:X`);
  
  return data.map((row: any[]) => {
    const outboundMessages = Number(row[15]) || 0;
    const positiveResponses = Number(row[16]) || 0;
    const postsCreated = Number(row[18]) || 0;
    const leadsGenerated = Number(row[19]) || 0;
    const marketingXP = Number(row[21]) || 0;

    return {
      date: row[0] || '',
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
  const data = await fetchSheetRange(`${SHEET_TABS.PROJECTIONS}!A2:J15`);
  
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