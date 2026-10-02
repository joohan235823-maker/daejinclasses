import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// NEIS Constants for 대진전자통신고등학교
const NEIS_CONSTANTS = {
  ATPT_OFCDC_SC_CODE: 'C10', // 부산광역시교육청
  SD_SCHUL_CODE: '7150536',   // 대진전자통신고등학교 (부산 C10, 코드 7150536)
  SCHUL_NM: '대진전자통신고등학교',
  DEFAULT_KEY: '3edfb52504384bf7a8e7454cfaee6d2e', // Public key or sample
};

// API proxy for Timetable (hisTimetable)
app.get('/api/timetable', async (req: Request, res: Response) => {
  try {
    const { grade = '1', classNm = '1', fromYmd, toYmd, apiKey } = req.query;
    
    const keyToUse = (apiKey as string) || process.env.NEIS_API_KEY || NEIS_CONSTANTS.DEFAULT_KEY;
    
    let url = `https://open.neis.go.kr/hub/hisTimetable?Type=json&pIndex=1&pSize=100` +
      `&ATPT_OFCDC_SC_CODE=${NEIS_CONSTANTS.ATPT_OFCDC_SC_CODE}` +
      `&SD_SCHUL_CODE=${NEIS_CONSTANTS.SD_SCHUL_CODE}` +
      `&GRADE=${encodeURIComponent(grade as string)}` +
      `&CLASS_NM=${encodeURIComponent(classNm as string)}`;
      
    if (keyToUse) {
      url += `&KEY=${encodeURIComponent(keyToUse)}`;
    }
    if (fromYmd) {
      url += `&TI_FROM_YMD=${encodeURIComponent(fromYmd as string)}`;
    }
    if (toYmd) {
      url += `&TI_TO_YMD=${encodeURIComponent(toYmd as string)}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching timetable from NEIS:', error);
    res.status(500).json({ error: 'Failed to fetch timetable', message: error.message });
  }
});

// API proxy for Meal Service (mealServiceDietInfo)
app.get('/api/meal', async (req: Request, res: Response) => {
  try {
    const { fromYmd, toYmd, apiKey } = req.query;
    
    const keyToUse = (apiKey as string) || process.env.NEIS_API_KEY || NEIS_CONSTANTS.DEFAULT_KEY;
    
    let url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=50` +
      `&ATPT_OFCDC_SC_CODE=${NEIS_CONSTANTS.ATPT_OFCDC_SC_CODE}` +
      `&SD_SCHUL_CODE=${NEIS_CONSTANTS.SD_SCHUL_CODE}`;
      
    if (keyToUse) {
      url += `&KEY=${encodeURIComponent(keyToUse)}`;
    }
    if (fromYmd) {
      url += `&MLSV_FROM_YMD=${encodeURIComponent(fromYmd as string)}`;
    }
    if (toYmd) {
      url += `&MLSV_TO_YMD=${encodeURIComponent(toYmd as string)}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching meals from NEIS:', error);
    res.status(500).json({ error: 'Failed to fetch meal info', message: error.message });
  }
});

// API proxy for School Schedule (SchoolSchedule)
app.get('/api/schedule', async (req: Request, res: Response) => {
  try {
    const { fromYmd, toYmd, apiKey } = req.query;
    
    const keyToUse = (apiKey as string) || process.env.NEIS_API_KEY || NEIS_CONSTANTS.DEFAULT_KEY;
    
    let url = `https://open.neis.go.kr/hub/SchoolSchedule?Type=json&pIndex=1&pSize=100` +
      `&ATPT_OFCDC_SC_CODE=${NEIS_CONSTANTS.ATPT_OFCDC_SC_CODE}` +
      `&SD_SCHUL_CODE=${NEIS_CONSTANTS.SD_SCHUL_CODE}`;
      
    if (keyToUse) {
      url += `&KEY=${encodeURIComponent(keyToUse)}`;
    }
    if (fromYmd) {
      url += `&AA_FROM_YMD=${encodeURIComponent(fromYmd as string)}`;
    }
    if (toYmd) {
      url += `&AA_TO_YMD=${encodeURIComponent(toYmd as string)}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching schedule from NEIS:', error);
    res.status(500).json({ error: 'Failed to fetch school schedule', message: error.message });
  }
});

// School Info Endpoint
app.get('/api/school-info', (req: Request, res: Response) => {
  res.json({
    schoolName: NEIS_CONSTANTS.SCHUL_NM,
    officeCode: NEIS_CONSTANTS.ATPT_OFCDC_SC_CODE,
    officeName: '부산광역시교육청',
    schoolCode: NEIS_CONSTANTS.SD_SCHUL_CODE,
    location: '부산광역시 금정구 부곡로 25',
    website: 'https://school.busanedu.net/pdj-h/main.do',
    departments: [
      { id: 'ai-sw', name: 'AI소프트웨어과', color: 'indigo' },
      { id: 'smart-sw', name: '스마트소프트웨어과', color: 'cyan' },
      { id: 'elec-comm', name: '전자통신과', color: 'emerald' },
      { id: 'elec-control', name: '전기제어과', color: 'amber' },
      { id: 'comm-net', name: '정보통신과', color: 'purple' },
    ]
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
