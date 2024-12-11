// app/lib/sheets.ts

// Helper function to handle ANY type of percentage value
function parsePercentage(value: any): number {
  // If it's a string ending with %
  if (typeof value === 'string' && value.endsWith('%')) {
    return parseFloat(value.replace('%', '')) / 100;
  }
  // If it's already a decimal number
  if (typeof value === 'number') {
    return value;
  }
  // Default case
  return 0;
}

export async function fetchSheetData() {
  try {
    const spreadsheetId = "1DUIj8ILJn2l5or35ihq-meBDyv_TAU22aLeyul8z_WM";
    const apiKey = "AIzaSyA8xFp3JzgFdgbSTdUjO7wMI32yz0NVKGQ";
    const range = 'Analysis!A2:O';
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.values) {
      console.error('No data values returned from sheets');
      return [];
    }

    // More defensive data processing
    return data.values.map((row: any[]) => ({
      date: row[0] || '',
      dials: parseInt(String(row[1])) || 0,
      triage: parseInt(String(row[2])) || 0,
      triageRate: parsePercentage(row[3]),
      appointments: parseInt(String(row[4])) || 0,
      setRate: parsePercentage(row[5]),
      shows: parseInt(String(row[6])) || 0,
      showRate: parsePercentage(row[7]),
      closes: parseInt(String(row[8])) || 0,
      closeRate: parsePercentage(row[9]),
      revenue: parseFloat(String(row[10])) || 0,
      revenuePerClose: parseFloat(String(row[11])) || 0,
      energy: parseFloat(String(row[12])) || 0,
      totalXP: parseInt(String(row[13])) || 0
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