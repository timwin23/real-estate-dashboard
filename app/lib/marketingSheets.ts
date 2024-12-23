// app/lib/marketingSheets.ts

// Improved safe rate function to handle edge cases and prevent >100% results
function safeRate(numerator: any, denominator: any): number {
  const num = parseFloat(numerator);
  const denom = parseFloat(denominator);
  if (isNaN(num) || isNaN(denom) || denom === 0) {
    return 0;
  }
  const rate = (num / denom) * 100;
  return rate > 100 ? 100 : Math.round(rate * 10) / 10; // Cap at 100% and round to 1 decimal
}

// Interface for marketing metrics
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

// Fetch marketing data for a specific team member
export async function fetchTeamMemberMarketingData(memberName: string): Promise<MarketingMetrics[]> {
  try {
    const spreadsheetId = "1tliv1aCy4VJEDvwwUFkNa34eSL_h-uB4gaBUnUhtE4";
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    const range = `${memberName} Analysis!A2:X`; // Expanded range to include all columns

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) {
      console.error(`No marketing data values returned for ${memberName}`);
      return [];
    }

    return data.values.map((row: any[]) => {
      // Get raw numbers based on your sheet structure
      const outboundMessages = Number(row[15]) || 0;  // Column P
      const positiveResponses = Number(row[16]) || 0; // Column Q
      const postsCreated = Number(row[18]) || 0;      // Column S
      const leadsGenerated = Number(row[19]) || 0;    // Column T
      const marketingXP = Number(row[21]) || 0;       // Column V

      return {
        date: row[0] || '',                           // Column A
        outboundMessages,
        positiveResponses,
        responseRate: safeRate(positiveResponses, outboundMessages),
        postsCreated,
        leadsGenerated,
        leadsPerPost: safeRate(leadsGenerated, postsCreated),
        marketingXP
      };
    });

  } catch (error) {
    console.error('Error fetching marketing data:', error);
    return [];
  }
}

// Interface for team member projections
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

// Fetch marketing projections for all team members
export async function fetchMarketingProjections(): Promise<TeamProjections> {
  try {
    const spreadsheetId = "1tliv1aCy4VJEDvwwUFkNa34eSL_h-uB4gaBUnUhtE4";
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    const range = 'Projections!A2:J15';  // Full projections range

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) {
      throw new Error('No marketing projections data returned from sheets');
    }

    // Initialize projections object
    const projections: TeamProjections = {
      chris: {
        outbound: { daily: 0, weekly: 0, monthly: 0 },
        posts: { daily: 0, weekly: 0, monthly: 0 },
        leads: { daily: 0, weekly: 0, monthly: 0 },
        responses: { daily: 0, weekly: 0, monthly: 0 }
      },
      israel: {
        outbound: { daily: 0, weekly: 0, monthly: 0 },
        posts: { daily: 0, weekly: 0, monthly: 0 },
        leads: { daily: 0, weekly: 0, monthly: 0 },
        responses: { daily: 0, weekly: 0, monthly: 0 }
      },
      ivette: {
        outbound: { daily: 0, weekly: 0, monthly: 0 },
        posts: { daily: 0, weekly: 0, monthly: 0 },
        leads: { daily: 0, weekly: 0, monthly: 0 },
        responses: { daily: 0, weekly: 0, monthly: 0 }
      }
    };

    // Map sheet metrics to projection keys
    const metricMap: { [key: string]: keyof TeamMemberProjections } = {
      'Outbound': 'outbound',
      'Posts': 'posts',
      'Leads': 'leads',
      'Responses': 'responses'
    };

    // Process each row
    data.values.forEach((row: any[]) => {
      const metricKey = metricMap[row[0]];
      if (metricKey) {
        // Chris (columns B,C,D)
        projections.chris[metricKey] = {
          daily: Number(row[1]) || 0,
          weekly: Number(row[2]) || 0,
          monthly: Number(row[3]) || 0
        };

        // Israel (columns E,F,G)
        projections.israel[metricKey] = {
          daily: Number(row[4]) || 0,
          weekly: Number(row[5]) || 0,
          monthly: Number(row[6]) || 0
        };

        // Ivette (columns H,I,J)
        projections.ivette[metricKey] = {
          daily: Number(row[7]) || 0,
          weekly: Number(row[8]) || 0,
          monthly: Number(row[9]) || 0
        };
      }
    });

    return projections;

  } catch (error) {
    console.error('Error fetching marketing projections:', error);
    throw error;
  }
}