import type { Category, AffiliateLink } from "@/data/affiliateLinks";

interface SheetRow {
  category: string;
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

export async function fetchFromGoogleSheet(sheetUrl: string): Promise<Category[]> {
  // Convert Google Sheets URL to CSV export URL
  let csvUrl = sheetUrl;
  
  // Handle different Google Sheets URL formats
  if (sheetUrl.includes('/edit')) {
    csvUrl = sheetUrl.replace('/edit', '/export?format=csv');
  } else if (sheetUrl.includes('/pubhtml')) {
    csvUrl = sheetUrl.replace('/pubhtml', '/pub?output=csv');
  } else if (!sheetUrl.includes('output=csv') && !sheetUrl.includes('format=csv')) {
    // If it's a sharing link, try to convert it
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
    }
  }

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch Google Sheet');
  }
  
  const csvText = await response.text();
  return parseCSV(csvText);
}

function parseCSV(csvText: string): Category[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  
  // Find column indices
  const categoryIdx = headers.findIndex(h => h === 'category');
  const idIdx = headers.findIndex(h => h === 'id');
  const titleIdx = headers.findIndex(h => h === 'title');
  const descIdx = headers.findIndex(h => h === 'description');
  const thumbIdx = headers.findIndex(h => h === 'thumbnail');
  const urlIdx = headers.findIndex(h => h === 'url');
  
  // Parse rows
  const rows: SheetRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= 4) {
      rows.push({
        category: values[categoryIdx] || 'Other Resources',
        id: values[idIdx] || `item-${i}`,
        title: values[titleIdx] || '',
        description: values[descIdx] || '',
        thumbnail: values[thumbIdx] || '',
        url: values[urlIdx] || '',
      });
    }
  }
  
  // Group by category
  const categoryMap = new Map<string, AffiliateLink[]>();
  
  for (const row of rows) {
    if (!row.title || !row.url) continue;
    
    const categoryName = row.category || 'Other Resources';
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }
    
    categoryMap.get(categoryName)!.push({
      id: row.id,
      title: row.title,
      description: row.description,
      thumbnail: row.thumbnail,
      url: row.url,
    });
  }
  
  // Convert to Category array
  const categories: Category[] = [];
  categoryMap.forEach((links, name) => {
    categories.push({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      emoji: "📌",
      links,
    });
  });
  
  return categories;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
