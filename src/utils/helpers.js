import { hariMelayu } from '../constants/data';

export const countWorkDays = (start, end) => {
  let count = 0;
  let cur = new Date(start);
  const stop = new Date(end);
  while (cur <= stop) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

export const formatTimeTo12h = (t) => {
  let [h, m] = t.split(':');
  h = parseInt(h);
  const ampm = h >= 12 ? 'P.M.' : 'A.M.';
  h = h % 12 || 12;
  return `${h}.${m} ${ampm}`;
};

export const getRecordCategory = (typeString) => {
  const type = typeString.toUpperCase();
  if (type.includes("BERSALIN")) return 'BERSALIN';
  if (type.includes("SAKIT")) return 'SAKIT';
  if (type.includes("TIME-SLIP") || type.includes("TIME SLIP")) return 'TIMESLIP';
  if (type.includes("REHAT KHAS") || type === "CRK" || type.includes("CUTI REHAT") || type.includes("KECEMASAN") || type.includes("CTR") || type.includes("TANPA REKOD")) return 'CRK_CR';
  return 'RASMI';
};

export const isDateInRange = (targetDateYMD, dateInfo) => {
  // dateInfo formats: "DD.MM.YYYY" or "DD.MM.YYYY - DD.MM.YYYY"
  const rangeMatch = dateInfo.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s*-\s*(\d{2})\.(\d{2})\.(\d{4}))?/);
  if (!rangeMatch) return false;

  const target = new Date(targetDateYMD);
  target.setHours(0, 0, 0, 0);

  const sD = new Date(`${rangeMatch[3]}-${rangeMatch[2]}-${rangeMatch[1]}`);
  sD.setHours(0, 0, 0, 0);

  let eD;
  if (rangeMatch[4]) {
    eD = new Date(`${rangeMatch[6]}-${rangeMatch[5]}-${rangeMatch[4]}`);
  } else {
    eD = new Date(sD);
  }
  eD.setHours(0, 0, 0, 0);

  return target >= sD && target <= eD;
};

export const getDayName = (dateStr) => {
  if (!dateStr) return "";
  // Supports YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY, etc.
  const parts = dateStr.split(/[\.\/-]/);
  if (parts.length < 3) return "";
  
  let y, m, d;
  if (parts[0].length === 4) {
    [y, m, d] = parts;
  } else {
    [d, m, y] = parts;
  }
  
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return hariMelayu[dateObj.getDay()] || "";
};

export const enrichDateInfoWithDay = (dateInfo) => {
  if (!dateInfo || typeof dateInfo !== 'string') return "";
  
  // Use a more relaxed regex for date matching
  const dateRegex = /(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{4})/g;
  const matches = [...dateInfo.matchAll(dateRegex)];
  
  if (matches.length === 0) return dateInfo;

  // Already has day info? (Case-insensitive check)
  const upperDateInfo = dateInfo.toUpperCase();
  if (hariMelayu.some(day => upperDateInfo.includes(day))) return dateInfo;

  const startMatch = matches[0];
  const startDay = getDayName(`${startMatch[1]}.${startMatch[2]}.${startMatch[3]}`);
  if (!startDay) return dateInfo;

  let dayPart = startDay;

  // If there's a second date mentioned (a range)
  if (matches.length > 1) {
    const endMatch = matches[1];
    const endDay = getDayName(`${endMatch[1]}.${endMatch[2]}.${endMatch[3]}`);
    if (endDay) {
      dayPart = `${startDay} - ${endDay}`;
    }
  }

  // Inject into parentheses if they exist, otherwise append
  if (dateInfo.includes('(')) {
    return dateInfo.replace('(', `(${dayPart}, `);
  } else {
    return `${dateInfo} (${dayPart})`;
  }
};
