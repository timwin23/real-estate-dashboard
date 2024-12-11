// lib/sheets.ts

interface SheetRow {
  date: string;
  outbound: number;
  triage: number;
  triageRate: number;
  appointments: number;
  setRate: number;
  shows: number;
  showRate: number;
  closes: number;
  closeRate: number;
  revenue: number;
  revenuePerClose: number;
  energy: number;
  totalXP: number;
}

export async function fetchSheetData(): Promise<SheetRow[]> {
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

    // Safely convert any value to number
    const toNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (!value) return 0;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };

    return data.values.map((row: any[]): SheetRow => {
      return {
        date: String(row[0] || ''),
        outbound: toNumber(row[1]),
        triage: toNumber(row[2]),
        triageRate: toNumber(row[3]),
        appointments: toNumber(row[4]),
        setRate: toNumber(row[5]),
        shows: toNumber(row[6]),
        showRate: toNumber(row[7]),
        closes: toNumber(row[8]),
        closeRate: toNumber(row[9]),
        revenue: toNumber(row[10]),
        revenuePerClose: toNumber(row[11]),
        energy: toNumber(row[12]),
        totalXP: toNumber(row[13])
      };
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
}

export function filterDataByDateRange(data: SheetRow[], startDate: string, endDate: string): SheetRow[] {
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