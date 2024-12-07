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

    return rows.map((row: any[]) => ({
      date: row[0],
      dials: Number(row[1]) || 0,
      triage: Number(row[2]) || 0,
      triageRate: row[3] ? Number(row[3].replace('%', '')) : 0,
      appointments: Number(row[4]) || 0,
      setRate: row[5] ? Number(row[5].replace('%', '')) : 0,
      shows: Number(row[6]) || 0,
      showRate: row[7] ? Number(row[7].replace('%', '')) : 0,
      closes: Number(row[8]) || 0,
      closeRate: row[9] ? Number(row[9].replace('%', '')) : 0,
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