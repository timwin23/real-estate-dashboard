// app/lib/sheets.ts

// Helper function that's more defensive about handling percentages
function safeParsePercentage(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace('%', '');
    return parseFloat(cleaned) / 100 || 0;
  }
  return 0;
}

export async function fetchSheetData() {
  try {
    const spreadsheetId = "1DUIj8ILJn2l5or35ihq-meBDyv_TAU22aLeyul8z_WM";
    const apiKey = "AIzaSyA8xFp3JzgFdgbSTdUjO7wMI32yz0NVKGQ";
    const range = 'Analysis!A2:O';
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.values) {
      console.error('No data values returned from sheets');
      return [];
    }

    // More defensive data mapping
    return data.values.map((row: any[]) => {
      try {
        return {
          date: row[0] || '',
          dials: parseInt(String(row[1])) || 0,
          triage: parseInt(String(row[2])) || 0,
          triageRate: safeParsePercentage(row[3]),
          appointments: parseInt(String(row[4])) || 0,
          setRate: safeParsePercentage(row[5]),
          shows: parseInt(String(row[6])) || 0,
          showRate: safeParsePercentage(row[7]),
          closes: parseInt(String(row[8])) || 0,
          closeRate: safeParsePercentage(row[9]),
          revenue: parseFloat(String(row[10])) || 0,
          revenuePerClose: parseFloat(String(row[11])) || 0,
          energy: parseFloat(String(row[12])) || 0,
          totalXP: parseInt(String(row[13])) || 0
        };
      } catch (e) {
        console.error('Error processing row:', e);
        return null;
      }
    }).filter(Boolean);

  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
}

export function filterDataByDateRange(data: any[], startDate: string, endDate: string) {
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