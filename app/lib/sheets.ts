// lib/sheets.ts

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

    console.log('Raw row data:', data.values);

    const processPercentage = (value: any): number => {
      console.log('Processing percentage value:', value, 'type:', typeof value);
      
      if (typeof value === 'number') {
        return value;
      }
      if (!value) {
        return 0;
      }
      if (typeof value === 'string') {
        const cleaned = value.replace('%', '');
        return Number(cleaned) || 0;
      }
      return 0;
    };

    return data.values.map((row: any[], index: number) => {
      try {
        console.log(`Processing row ${index}:`, row);
        
        return {
          date: row[0],
          outbound: Number(row[1] ?? 0),
          triage: Number(row[2] ?? 0),
          triageRate: Number(row[3] ?? 0), // Changed from processPercentage
          appointments: Number(row[4] ?? 0),
          setRate: Number(row[5] ?? 0),    // Changed from processPercentage
          shows: Number(row[6] ?? 0),
          showRate: Number(row[7] ?? 0),    // Changed from processPercentage
          closes: Number(row[8] ?? 0),
          closeRate: Number(row[9] ?? 0),    // Changed from processPercentage
          revenue: Number(row[10] ?? 0),
          revenuePerClose: Number(row[11] ?? 0),
          energy: Number(row[12] ?? 0),
          totalXP: Number(row[13] ?? 0)
        };
      } catch (error) {
        console.error(`Error processing row ${index}:`, row, error);
        // Return default values if row processing fails
        return {
          date: row[0] || new Date().toISOString(),
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
          totalXP: 0
        };
      }
    });
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
    } catch (error) {
      console.error('Error parsing date:', row.date, error);
      return false;
    }
  });
}