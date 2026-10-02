import type { VercelRequest, VercelResponse } from '@vercel/node';

const NEIS_CONSTANTS = {
  ATPT_OFCDC_SC_CODE: 'C10',
  SD_SCHUL_CODE: '7150597',
  DEFAULT_KEY: '3edfb52504384bf7a8e7454cfaee6d2e',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for Vercel deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { grade = '1', classNm = '1', fromYmd, toYmd, apiKey } = req.query;
    const keyToUse = (apiKey as string) || process.env.NEIS_API_KEY || NEIS_CONSTANTS.DEFAULT_KEY;

    let url = `https://open.neis.go.kr/hub/hisTimetable?Type=json&pIndex=1&pSize=100` +
      `&ATPT_OFCDC_SC_CODE=${NEIS_CONSTANTS.ATPT_OFCDC_SC_CODE}` +
      `&SD_SCHUL_CODE=${NEIS_CONSTANTS.SD_SCHUL_CODE}` +
      `&GRADE=${encodeURIComponent(grade as string)}` +
      `&CLASS_NM=${encodeURIComponent(classNm as string)}`;

    if (keyToUse) url += `&KEY=${encodeURIComponent(keyToUse)}`;
    if (fromYmd) url += `&TI_FROM_YMD=${encodeURIComponent(fromYmd as string)}`;
    if (toYmd) url += `&TI_TO_YMD=${encodeURIComponent(toYmd as string)}`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch timetable', message: error.message });
  }
}
