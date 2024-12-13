// app/lib/sheets.ts

function safeRate(value: any): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
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

    return data.values.map((row: any[]) => ({
      date: row[0],
      dials: Number(row[1]) || 0,
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