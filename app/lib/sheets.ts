// app/lib/sheets.ts

// Helper function to parse percentage values
function parsePercentage(value: any): number {
  if (typeof value === 'string') {
    return parseFloat(value.replace('%', '')) / 100;
  }
  if (typeof value === 'number') {
    return value;
  }
  return 0;
 }
 
 export async function fetchSheetData() {
  try {
    const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    const range = 'Analysis!A2:O';
    
    // Rest of your code...s
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.values) {
      console.error('No data values returned from sheets');
      return [];
    }
 
    // Enhanced data processing with percentage handling
    return data.values.map(row => ({
      date: row[0],
      dials: Number(row[1]) || 0,
      triage: Number(row[2]) || 0,
      triageRate: parsePercentage(row[3]),
      appointments: Number(row[4]) || 0, 
      setRate: parsePercentage(row[5]),
      shows: Number(row[6]) || 0,
      showRate: parsePercentage(row[7]),
      closes: Number(row[8]) || 0,
      closeRate: parsePercentage(row[9]),
      revenue: Number(row[10]) || 0,
      revenuePerClose: Number(row[11]) || 0,
      energy: Number(row[12]) || 0,
      totalXP: Number(row[13]) || 0
    }));
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