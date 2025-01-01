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
  outbound_messages: number;
  positive_responses: number;
  response_rate: number;
  posts_created: number;
  leads_generated: number;
  leads_per_post: number;
  marketing_xp: number;
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

const MARKETING_SHEET_TABS = {
    chris: 'Chris Analysis',
    israel: 'Israel Analysis',
    ivette: 'Ivette Analysis',
    ALL: 'ALL'
} as const;

export async function fetchTeamMemberMarketingData(member: string) {
    try {
        console.log('[marketingSheets] Fetching data for member:', member);
        
        // Handle ALL case differently
        if (member === 'ALL') {
            // Fetch all members' data
            const promises = [
                fetchSheetData(`${MARKETING_SHEET_TABS.chris}!A2:V`),
                fetchSheetData(`${MARKETING_SHEET_TABS.israel}!A2:V`),
                fetchSheetData(`${MARKETING_SHEET_TABS.ivette}!A2:V`)
            ];
            
            const results = await Promise.all(promises);
            return results.flat(); // Combine all results
        }
        
        // For individual members, get the correct sheet name
        const sheetName = MARKETING_SHEET_TABS[member.toLowerCase()];
        if (!sheetName) {
            console.error(`[marketingSheets] Invalid member: ${member}`);
            return [];
        }
        
        const data = await fetchSheetData(`${sheetName}!A2:V`);
        return data;
    } catch (error) {
        console.error('[marketingSheets] Error fetching marketing data:', error);
        return [];
    }
}

export interface TeamMemberProjections {
  [key: string]: Projection;
  outbound_messages: Projection;
  positive_responses: Projection;
  posts_created: Projection;
  leads_generated: Projection;
}

export interface Projection {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface TeamProjections {
  [key: string]: TeamMemberProjections;
  CHRIS: TeamMemberProjections;
  ISRAEL: TeamMemberProjections;
  IVETTE: TeamMemberProjections;
  ALL: TeamMemberProjections;
}

export async function fetchMarketingProjections(): Promise<TeamProjections> {
  const data = await fetchSheetData(`${SHEET_TABS.PROJECTIONS}!A10:J13`);
  
  const metricMap: Record<string, keyof TeamMemberProjections> = {
    'Posts': 'posts_created',
    'Leads': 'leads_generated',
    'Outbound': 'outbound_messages',
    'Responses': 'positive_responses'
  };

  console.log('[marketingSheets] Raw projections data:', data);
  console.log('[marketingSheets] Metric map:', metricMap);
  
  const projections: TeamProjections = {
    CHRIS: createEmptyProjections(),
    ISRAEL: createEmptyProjections(),
    IVETTE: createEmptyProjections(),
    ALL: createEmptyProjections()
  };

  data.forEach((row: any[]) => {
    if (!row[0]) return;
    
    const metricName = row[0];
    console.log('[marketingSheets] Processing metric:', metricName);
    
    const metricKey = metricMap[metricName];
    if (!metricKey) {
      console.log('[marketingSheets] No mapping found for metric:', metricName);
      return;
    }

    ['CHRIS', 'ISRAEL', 'IVETTE'].forEach((member, i) => {
      const baseCol = i * 3 + 1;
      projections[member][metricKey] = {
        daily: Number(row[baseCol]) || 0,
        weekly: Number(row[baseCol + 1]) || 0,
        monthly: Number(row[baseCol + 2]) || 0
      };
    });

    projections.ALL[metricKey] = {
      daily: (projections.CHRIS[metricKey].daily + 
              projections.ISRAEL[metricKey].daily + 
              projections.IVETTE[metricKey].daily),
      weekly: (projections.CHRIS[metricKey].weekly + 
              projections.ISRAEL[metricKey].weekly + 
              projections.IVETTE[metricKey].weekly),
      monthly: (projections.CHRIS[metricKey].monthly + 
              projections.ISRAEL[metricKey].monthly + 
              projections.IVETTE[metricKey].monthly)
    };
  });

  console.log('[marketingSheets] Final projections:', projections);
  return projections;
}

function createEmptyProjections(): TeamMemberProjections {
  return {
    outbound_messages: { daily: 0, weekly: 0, monthly: 0 },
    positive_responses: { daily: 0, weekly: 0, monthly: 0 },
    posts_created: { daily: 0, weekly: 0, monthly: 0 },
    leads_generated: { daily: 0, weekly: 0, monthly: 0 }
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

export type MetricData = {
    [key: string]: {
        daily: number;
        weekly: number;
        monthly: number;
    };
};

const calculateMetrics = (data: any[]) => {
    let metrics = {
        totalOutboundMessages: 0,
        totalPositiveResponses: 0,
        totalPostsCreated: 0,
        totalLeadsGenerated: 0,
        totalRevenue: 0,
        marketingXP: 0,
        responseRate: 0,
        leadsPerPost: 0,
        revenuePerClose: 0
    };

    data.forEach(row => {
        const outbound = Number(row[1]) || 0;      // Column B
        const responses = Number(row[2]) || 0;      // Column C
        const posts = Number(row[18]) || 0;        // Column S
        const leads = Number(row[19]) || 0;        // Column T
        const xp = Number(row[21]) || 0;           // Column V

        metrics.totalOutboundMessages += outbound;
        metrics.totalPositiveResponses += responses;
        metrics.totalPostsCreated += posts;
        metrics.totalLeadsGenerated += leads;
        metrics.marketingXP += xp;
    });

    // Calculate rates
    metrics.responseRate = (metrics.totalPositiveResponses / metrics.totalOutboundMessages) * 100;
    metrics.leadsPerPost = metrics.totalLeadsGenerated / metrics.totalPostsCreated;

    return metrics;
};