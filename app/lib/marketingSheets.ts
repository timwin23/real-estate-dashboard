// app/lib/marketingSheets.ts

// Reuse the safe rate function
function safeRate(value: any): number {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
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
  
      return data.values.map((row: any[]) => ({
        date: row[0] || '',
        outboundMessages: Number(row[1]) || 0,
        positiveResponses: Number(row[2]) || 0,
        responseRate: safeRate(row[3]),
        vslViews: Number(row[4]) || 0,
        vslViewRate: safeRate(row[5]),
        trialUsers: Number(row[6]) || 0,
        trialRate: safeRate(row[7]),
        paidUsers: Number(row[8]) || 0,
        paidRate: safeRate(row[9]),
        postsCreated: Number(row[10]) || 0,
        leadsGenerated: Number(row[11]) || 0,
        leadsPerPost: safeRate(row[12]),
        marketingXP: Number(row[13]) || 0
      }));
    } catch (error) {
      console.error('Error fetching marketing data:', error);
      return [];
    }
  }
  
  // Marketing projections fetch function (if needed)
  export async function fetchMarketingProjections() {
    try {
      const spreadsheetId = "1NdCBL0usG_V7LlZBMfB43E48T3_NB5itV5ZeOsGAhJE";
      const apiKey = "AIzaSyA8xFp3JzgFdgbSTdUjO7wMI32yz0NVKGQ";
      const range = 'Marketing Projections!A2:D15';
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.values) {
        console.error('No marketing projections data returned from sheets');
        return null;
      }
  
      const projections = data.values.reduce((acc: { [key: string]: Projection }, row: any[]) => {
        const metric = row[0].toLowerCase().replace(' ', '_');
        acc[metric] = {
          daily: Number(row[1]) || 0,
          weekly: Number(row[2]) || 0,
          monthly: Number(row[3]) || 0
        };
        return acc;
      }, {});
  
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