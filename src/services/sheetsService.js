const SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRurffzCLMJ6ZD5UGqrosVqTszbwBcTUZxZqJa2SjTa7fTPPAKsr9DdCDAzQQfgZyut7IMNGVPtIqV4/pub?gid=0&single=true&output=csv"

const getSampleData = () => {
  return [
    { 
      Tip: "Marka",
      Isim: "Marka A", 
      HEDEF: "100000", 
      "TAHMİNİ KAPANIŞ": "120000", 
      TOPLAM: "95000", 
      "%": "95",
      OCAK: "8000", ŞUBAT: "7500", MART: "9000", NİSAN: "8500",
      MAYIS: "10000", HAZİRAN: "9500", TEMMUZ: "11000", AĞUSTOS: "10500",
      EYLÜL: "9000", EKİM: "8500", KASIM: "8000", ARALIK: "7500"
    },
    { 
      Tip: "Marka",
      Isim: "Marka B", 
      HEDEF: "80000", 
      "TAHMİNİ KAPANIŞ": "90000", 
      TOPLAM: "78000", 
      "%": "97.5",
      OCAK: "6500", ŞUBAT: "6000", MART: "7000", NİSAN: "6800",
      MAYIS: "7500", HAZİRAN: "7200", TEMMUZ: "8000", AĞUSTOS: "7800",
      EYLÜL: "7000", EKİM: "6500", KASIM: "6000", ARALIK: "5500"
    }
  ];
};

export const fetchSalesData = async () => {
  try {
    if (SHEETS_CSV_URL.includes("YOUR_SHEET_ID")) {
      return getSampleData();
    }

    const response = await fetch(SHEETS_CSV_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP hatası! Durum: ${response.status}`);
    }
    
    const csvText = await response.text();
    const parsedData = parseCSV(csvText);
    
    if (parsedData.length === 0) {
      return getSampleData();
    }
    
    return parsedData;
  } catch (error) {
    return getSampleData();
  }
};

const parseCSV = (csvText) => {
  try {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return [];
    }

    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
    const nameColumnIndex = 0;
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, '').trim());
      if (values.length > 0 && values[nameColumnIndex] && values[nameColumnIndex].trim() !== '') {
        const row = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        row['Isim'] = values[nameColumnIndex] || '';
        data.push(row);
      }
    }
    
    return data;
  } catch (error) {
    return [];
  }
};

const normalizeString = (str) => {
  return str.toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
};

const getColumnValue = (item, possibleNames) => {
  for (const name of possibleNames) {
    if (item[name] !== undefined && item[name] !== null && item[name] !== '') {
      return item[name];
    }
    const normalizedName = normalizeString(name);
    for (const key in item) {
      const normalizedKey = normalizeString(key);
      if (normalizedKey === normalizedName) {
        return item[key];
      }
    }
  }
  return null;
};

const parseNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const cleaned = String(value).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
};

const getMonthlyColumns = () => {
  return ['OCAK', 'Ocak', 'ŞUBAT', 'Şubat', 'MART', 'Mart', 'NİSAN', 'Nisan', 
          'MAYIS', 'Mayıs', 'HAZİRAN', 'Haziran', 'TEMMUZ', 'Temmuz', 
          'AĞUSTOS', 'Ağustos', 'EYLÜL', 'Eylül', 'EKİM', 'Ekim', 
          'KASIM', 'Kasım', 'ARALIK', 'Aralık'];
};

const processRow = (item) => {
  const monthlyCols = getMonthlyColumns();
  
  const columnNames = Object.keys(item);
  const firstColumnName = columnNames[0] || '';
  const firstColumnValue = item[firstColumnName] || '';
  
  const isFirstColumnTip = firstColumnName && (
    firstColumnName.toLowerCase().includes('tip') || 
    firstColumnName.toLowerCase().includes('tür') ||
    firstColumnName.toLowerCase().includes('type')
  );
  
  let tip = '';
  let name = '';
  
  if (isFirstColumnTip) {
    tip = firstColumnValue || '';
    const secondColumnName = columnNames[1] || '';
    name = item[secondColumnName] || Object.values(item)[1] || '';
  } else {
    tip = getColumnValue(item, [
      'Tip', 'tip', 'TIP', 'Tür', 'tür', 'TÜR', 
      'Type', 'type', 'TYPE', 'Kategori Tipi', 'Kategori Tipi',
      'Müşteri/Marka/Kategori/Kanal'
    ]) || '';
    
    name = item.Isim || 
           firstColumnValue ||
           getColumnValue(item, ['Isim', 'İsim', 'isim', 'Name', 'name', 'Müşteri', 'Marka', 'Kategori', 'Kanal']) || 
           '';
  }
  
  if (!name || name.trim() === '') return null;
  
  const toplam = parseNumber(getColumnValue(item, ['TOPLAM', 'Toplam', 'toplam', 'TOPLAM SATIŞ', 'Toplam Satış']));
  const hedef = parseNumber(getColumnValue(item, ['HEDEF', 'Hedef', 'hedef', 'HEDEF SATIŞ', 'Hedef Satış']));
  const tahminiKapanis = parseNumber(getColumnValue(item, ['TAHMİNİ KAPANIŞ', 'Tahmini Kapanış', 'tahmini kapanış', 'TAHMİNİ KAPANIŞ', 'Tahmini Kapanis', 'Tahmini Kapanis']));
  const yuzde = parseNumber(getColumnValue(item, ['%', 'Yüzde', 'yüzde', 'Yuzde', 'yuzde', 'YÜZDE', 'YÜZDE ORANI']));
  
  const aylikVeriler = {};
  let aylikToplam = 0;
  
  const monthNormalizedMap = {
    'ocak': 'Ocak',
    'subat': 'Şubat',
    'mart': 'Mart',
    'nisan': 'Nisan',
    'mayis': 'Mayıs',
    'haziran': 'Haziran',
    'temmuz': 'Temmuz',
    'agustos': 'Ağustos',
    'eylul': 'Eylül',
    'ekim': 'Ekim',
    'kasim': 'Kasım',
    'aralik': 'Aralık'
  };
  
  Object.keys(item).forEach(columnName => {
    const normalizedColumn = normalizeString(columnName);
    if (monthNormalizedMap[normalizedColumn] !== undefined) {
      const monthName = monthNormalizedMap[normalizedColumn];
      const monthValue = parseNumber(item[columnName]);
      if (monthValue !== null && monthValue !== undefined) {
        if (!aylikVeriler[monthName] || aylikVeriler[monthName] === 0) {
          aylikVeriler[monthName] = monthValue;
          aylikToplam += monthValue;
        }
      }
    }
  });
  
  monthlyCols.forEach(monthCol => {
    const monthValue = parseNumber(getColumnValue(item, [monthCol]));
    if (monthValue !== null && monthValue !== undefined) {
      let monthName = monthCol.toUpperCase();
      if (monthName === 'OCAK') monthName = 'Ocak';
      else if (monthName === 'ŞUBAT' || monthName === 'SUBAT') monthName = 'Şubat';
      else if (monthName === 'MART') monthName = 'Mart';
      else if (monthName === 'NİSAN' || monthName === 'NISAN') monthName = 'Nisan';
      else if (monthName === 'MAYIS') monthName = 'Mayıs';
      else if (monthName === 'HAZİRAN' || monthName === 'HAZIRAN') monthName = 'Haziran';
      else if (monthName === 'TEMMUZ') monthName = 'Temmuz';
      else if (monthName === 'AĞUSTOS' || monthName === 'AGUSTOS') monthName = 'Ağustos';
      else if (monthName === 'EYLÜL' || monthName === 'EYLUL') monthName = 'Eylül';
      else if (monthName === 'EKİM' || monthName === 'EKIM') monthName = 'Ekim';
      else if (monthName === 'KASIM') monthName = 'Kasım';
      else if (monthName === 'ARALIK') monthName = 'Aralık';
      
      if (!aylikVeriler[monthName] || aylikVeriler[monthName] === 0) {
        aylikVeriler[monthName] = monthValue;
        aylikToplam += monthValue;
      }
    }
  });
  
  return {
    name: name.trim(),
    tip: tip.trim(),
    toplamTutar: toplam,
    toplamAdet: aylikToplam,
    satisSayisi: 1,
    hedef: hedef,
    tahminiKapanis: tahminiKapanis,
    yuzde: yuzde,
    aylikVeriler: aylikVeriler
  };
};

export const groupByBrand = (data) => {
  const grouped = {};
  
  data.forEach((item) => {
    const processed = processRow(item);
    if (processed && processed.name) {
      const tip = processed.tip?.toLowerCase() || '';
      
      if (tip.includes('marka')) {
        grouped[processed.name] = processed;
      }
    }
  });
  
  return grouped;
};

export const groupByCategory = (data) => {
  const grouped = {};
  
  data.forEach((item) => {
    const processed = processRow(item);
    if (processed && processed.name) {
      const tip = processed.tip?.toLowerCase() || '';
      
      if (tip.includes('kategori')) {
        grouped[processed.name] = processed;
      }
    }
  });
  
  return grouped;
};

export const groupByCustomer = (data) => {
  const grouped = {};
  
  data.forEach((item) => {
    const processed = processRow(item);
    if (processed && processed.name) {
      const tip = processed.tip?.toLowerCase() || '';
      
      if (tip.includes('müşteri') || tip.includes('musteri')) {
        grouped[processed.name] = processed;
      }
    }
  });
  
  return grouped;
};

export const groupByChannel = (data) => {
  const grouped = {};
  
  data.forEach((item) => {
    const processed = processRow(item);
    if (processed && processed.name) {
      const tip = processed.tip?.toLowerCase() || '';
      
      if (tip.includes('kanal') || tip.includes('channel')) {
        grouped[processed.name] = processed;
      }
    }
  });
  
  return grouped;
};

export const groupByProduct = (data) => {
  const grouped = {};
  
  data.forEach((item) => {
    const processed = processRow(item);
    if (processed && processed.name) {
      const tip = processed.tip?.toLowerCase() || '';
      
      if (tip.includes('ürün') || tip.includes('product')) {
        grouped[processed.name] = processed;
      }
    }
  });
  
  return grouped;
};
