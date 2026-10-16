import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initialDashboardData } from './src/data/initialData';
import { DashboardData, HistoryEntry } from './src/types/dashboard';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const DEFAULT_ADMIN_KEY = 'mbp-admin-2026';

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize store if missing
function loadData(): { currentData: DashboardData; history: HistoryEntry[]; adminKey: string } {
  let currentData = initialDashboardData;
  let history: HistoryEntry[] = [];
  let adminKey = DEFAULT_ADMIN_KEY;

  try {
    if (fs.existsSync(STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      if (parsed.currentData) currentData = parsed.currentData;
      if (parsed.adminKey) adminKey = parsed.adminKey;
    } else {
      // Create initial snapshot
      history.push({
        id: `hist-init-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'initial',
        summary: 'Data Awal Gudang PT. MBG',
        data: initialDashboardData
      });
      fs.writeFileSync(STORE_FILE, JSON.stringify({ currentData, adminKey }, null, 2));
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    }

    if (fs.existsSync(HISTORY_FILE)) {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading store data:', err);
  }

  return { currentData, history, adminKey };
}

function saveData(currentData: DashboardData, adminKey?: string) {
  const existing = loadData();
  const keyToSave = adminKey || existing.adminKey || DEFAULT_ADMIN_KEY;
  fs.writeFileSync(STORE_FILE, JSON.stringify({ currentData, adminKey: keyToSave }, null, 2));
}

function saveHistory(history: HistoryEntry[]) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Endpoints
  app.get('/api/data', (req: Request, res: Response) => {
    const data = loadData();
    res.json(data);
  });

  app.post('/api/data', (req: Request, res: Response) => {
    const { data, source, summary, adminKey } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const { history, adminKey: currentKey } = loadData();
    if (adminKey !== currentKey && adminKey !== DEFAULT_ADMIN_KEY) {
      return res.status(403).json({ error: 'Akses ditolak: Hanya pengelola yang dapat mengubah data.' });
    }

    saveData(data, adminKey || currentKey);

    const newHistoryEntry: HistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      source: source || 'manual',
      summary: summary || 'Pembaruan data dashboard',
      data
    };

    // Keep last 50 history entries
    const updatedHistory = [newHistoryEntry, ...history].slice(0, 50);
    saveHistory(updatedHistory);

    res.json({ success: true, currentData: data, history: updatedHistory });
  });

  app.post('/api/history/restore', (req: Request, res: Response) => {
    const { historyId, adminKey } = req.body;
    const { history, adminKey: currentKey } = loadData();
    if (adminKey !== currentKey && adminKey !== DEFAULT_ADMIN_KEY) {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }

    const entry = history.find(h => h.id === historyId);
    if (!entry) {
      return res.status(404).json({ error: 'History item not found' });
    }

    saveData(entry.data, adminKey || currentKey);

    const restoreEntry: HistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      source: 'restore',
      summary: `Pulihkan versi (${new Date(entry.timestamp).toLocaleString('id-ID')})`,
      data: entry.data
    };
    const updatedHistory = [restoreEntry, ...history].slice(0, 50);
    saveHistory(updatedHistory);

    res.json({ success: true, currentData: entry.data, history: updatedHistory });
  });

  app.delete('/api/history/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const adminKey = req.query.adminKey || req.headers['x-admin-key'];
    const { history, adminKey: currentKey } = loadData();
    if (adminKey !== currentKey && adminKey !== DEFAULT_ADMIN_KEY) {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }

    const filtered = history.filter(h => h.id !== id);
    saveHistory(filtered);
    res.json({ success: true, history: filtered });
  });

  app.delete('/api/history', (req: Request, res: Response) => {
    const adminKey = req.query.adminKey || req.headers['x-admin-key'];
    const { adminKey: currentKey } = loadData();
    if (adminKey !== currentKey && adminKey !== DEFAULT_ADMIN_KEY) {
      return res.status(403).json({ error: 'Akses ditolak.' });
    }

    saveHistory([]);
    res.json({ success: true, history: [] });
  });

  // Check if running in development mode
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
