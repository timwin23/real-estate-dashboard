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

// Marketing data fetching function
export async function fetchMarketingData() {
  try {
    const spreadsheetId = "1NdCBL0usG_V7LlZBMfB43E48T3_NB5itV5ZeOsGAhJE";
    const apiKey = "AIzaSyA8xFp3JzgFdgbSTdUjO7wMI32yz0NVKGQ";
    const range = 'Marketing Analysis!A2:N';

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) {
      console.error('No marketing data values returned from Google Sheets');
      return [];
    }

    return data.values.map((row: any[]) => {
      // First get all raw numbers
      const outboundMessages = Number(row[1]) || 0;
      const positiveResponses = Number(row[2]) || 0;
      const vslViews = Number(row[4]) || 0;
      const trialUsers = Number(row[6]) || 0;
      const paidUsers = Number(row[8]) || 0;
      const postsCreated = Number(row[10]) || 0;
      const leadsGenerated = Number(row[11]) || 0;
    
      // Calculate rates - matching your Google Sheet exactly
      const responseRate = safeRate(positiveResponses, outboundMessages);
      const vslViewRate = safeRate(vslViews, outboundMessages);  // This was wrong before
      const trialRate = safeRate(trialUsers, vslViews);      // As percentage of VSL Views
    
      return {
        date: row[0] || '',
        outboundMessages,
        positiveResponses,
        responseRate,
        vslViews,
        vslViewRate,           // Fixed
        trialUsers,
        trialRate,            // Fixed
        paidUsers,
        paidRate: safeRate(paidUsers, trialUsers),
        postsCreated,
        leadsGenerated,
        leadsPerPost: safeRate(leadsGenerated, postsCreated),
        marketingXP: Number(row[13]) || 0
      };
    });

  } catch (error) {
    console.error('Error fetching marketing data:', error);
    return [];
  }
}

// Marketing projections fetch function
export async function fetchMarketingProjections() {
  try {
    const spreadsheetId = "1NdCBL0usG_V7LlZBMfB43E48T3_NB5itV5ZeOsGAhJE";
    const apiKey = "AIzaSyA8xFp3JzgFdgbSTdUjO7wMI32yz0NVKGQ";
    const range = 'Projections!A8:D14';

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) {
      console.error('No marketing projections data returned from sheets');
      return null;
    }

    const metricMap: { [key: string]: string } = {
      'Posts': 'posts',
      'Leads': 'leads',
      'Outbound Msgs': 'outbound_msgs',
      'Responses': 'responses',
      'VSL Views': 'vsl_views',
      'Trials': 'trials',
      'Paid Conv': 'paid_conv'
    };

    const projections = data.values.reduce((acc: { [key: string]: any }, row: any[]) => {
      const origMetricName = row[0];
      const mappedName = metricMap[origMetricName];

      if (mappedName) {
        acc[mappedName] = {
          daily: Number(row[1]) || 0,
          weekly: Number(row[2]) || 0,
          monthly: Number(row[3]) || 0
        };
      }
      return acc;
    }, {});

    console.log('Marketing Projections:', projections); // For debugging
    return projections;

  } catch (error) {
    console.error('Error fetching marketing projections:', error);
    return null;
  }
}

// Projection type interface
interface Projection {
  daily: number;
  weekly: number;
  monthly: number;
}
