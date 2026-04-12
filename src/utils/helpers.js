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
