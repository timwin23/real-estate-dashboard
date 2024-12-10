// lib/sheets.ts
export async function fetchSheetData() {
  try {
    const spreadsheetId = "1DUIj8ILJn2l5or35ihq-meBDyv_TAU22aLeyul8z_WM";
    const apiKey = "AIzaSyA8xFp3JzgFdgbSTdUjO7wMI32yz0NVKGQ";
    
    console.log('Debug - Sheet ID:', spreadsheetId);
    console.log('Debug - API Key:', apiKey);

    const range = 'Analysis!A2:O';
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
    
    console.log('Debug - URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    const rows = data.values || [];

    console.log('Raw data from sheets:', rows);

    const processPercentage = (value: any): number => {
      if (typeof value === 'number') return value;
      if (!value) return 0;
      if (typeof value === 'string') {
        return Number(value.replace('%', '')) || 0;
      }
      return 0;
    };

    return rows.map((row: any[]) => ({
      date: row[0],
      dials: Number(row[1]) || 0,
      triage: Number(row[2]) || 0,
      triageRate: processPercentage(row[3]),
      appointments: Number(row[4]) || 0,
      setRate: processPercentage(row[5]),
      shows: Number(row[6]) || 0,
      showRate: processPercentage(row[7]),
      closes: Number(row[8]) || 0,
      closeRate: processPercentage(row[9]),
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
  return data.filter(row => {
    const rowDate = new Date(row.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return rowDate >= start && rowDate <= end;
  });
}