// app/lib/sheets.ts

interface SheetRow {
  date: string;
  dials: number;
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.values) {
      console.error('No data values returned from sheets');
      return [];
    }

    // Convert any value to a safe number
    const safeNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (!value) return 0;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };

    return data.values.map((row: any[]): SheetRow => {
      try {
        return {
          date: String(row[0] || ''),
          dials: safeNumber(row[1]),
          triage: safeNumber(row[2]),
          triageRate: safeNumber(row[3]),
          appointments: safeNumber(row[4]),
          setRate: safeNumber(row[5]),
          shows: safeNumber(row[6]),
          showRate: safeNumber(row[7]),
          closes: safeNumber(row[8]),
          closeRate: safeNumber(row[9]),
          revenue: safeNumber(row[10]),
          revenuePerClose: safeNumber(row[11]),
          energy: safeNumber(row[12]),
          totalXP: safeNumber(row[13])
        };
      } catch (error) {
        console.error('Error processing row:', row, error);
        // Return safe defaults if processing fails
        return {
          date: String(row[0] || new Date().toISOString()),
          dials: 0,
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
          totalXP: 0
        };
      }
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
