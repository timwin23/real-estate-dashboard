// app/lib/sheets.ts

// This function helps ensure that a value is safely converted to a number.
function safeRate(value: any): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

// Fetches data from Google Sheets and returns it in a structured format
export async function fetchSheetData() {
  try {
    const spreadsheetId = "1NdCBL0usG_V7LlZBMfB43E48T3_NB5itV5ZeOsGAhJE";
    const apiKey = "AIzaSyA8xFp3JzgFdgbSTdUjO7wMI32yz0NVKGQ";
    const range = 'Sales Analysis!A2:N'; // Adjusted range
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
    const response = await fetch(url);
    const data = await response.json();

    console.log('Raw sheet data:', JSON.stringify(data, null, 2));

    if (!data.values) {
      console.error('No data values returned from Google Sheets');
      return [];
    }

    // Process the sheet data and return it in a structured format
    return data.values.map((row: any[]) => {
      if (!row || row.length < 13) {
        console.warn('Row has insufficient data:', row);
        return {
          date: '',
          outbound: 0,
          triage: 0,
          triageRate: 0,
          appointments: 0,
          setRate: 0,
          shows: 0,
          showRate: 0,
          closes: 0,
          closeRate: 0,
          revenue: 0,
          revenuePerClose: 0,
          energy: 0,
          totalXP: 0 // Default to 0 for missing values
        };
      }

      return {
        date: row[0] || '',
        outbound: Number(row[1]) || 0,
        triage: Number(row[2]) || 0,
        triageRate: safeRate(row[3]),
        appointments: Number(row[4]) || 0,
        setRate: safeRate(row[5]),
        shows: Number(row[6]) || 0,
        showRate: safeRate(row[7]),
        closes: Number(row[8]) || 0,
        closeRate: safeRate(row[9]),
        revenue: Number(row[10]) || 0,
        revenuePerClose: Number(row[11]) || 0,
        energy: Number(row[12]) || 0,
        totalXP: row.length >= 13 ? Number(row[12]) : 0 // Adjust for column "M"
      };
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
}

// Filters the data based on a date range
export function filterDataByDateRange(data: any[], startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return data.filter(row => {
    try {
      const rowDate = new Date(row.date);
      return rowDate >= start && rowDate <= end;
    } catch {
      return false; // If the date is invalid, skip that row
    }
  });
}

// Fetches projection data from Google Sheets and returns it in a structured format
export async function fetchProjections() {
  try {
    const spreadsheetId = "1NdCBL0usG_V7LlZBMfB43E48T3_NB5itV5ZeOsGAhJE";
    const apiKey = "AIzaSyA8xFp3JzgFdgbSTdUjO7wMI32yz0NVKGQ";
    const range = 'Projections!A2:D15';
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.values) {
      console.error('No projections data returned from sheets');
      return null;
    }

    // Define the accumulator type within the reduce function
    const projections = data.values.reduce((acc: { [key: string]: Projection }, row: any[]) => {
      const metric = row[0].toLowerCase().replace(' ', '_');
      acc[metric] = {
        daily: Number(row[1]) || 0,
        weekly: Number(row[2]) || 0,
        monthly: Number(row[3]) || 0
      };
      return acc;
    }, {}); // Initial value is an empty object

    return projections;

  } catch (error) {
    console.error('Error fetching projections:', error);
    return null;
  }
}

// Projection type interface
interface Projection {
  daily: number;
  weekly: number;
  monthly: number;
}
