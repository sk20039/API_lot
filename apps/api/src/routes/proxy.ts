import { Router, Request, Response, NextFunction } from 'express';
import { executeRequest } from '../services/proxyService';
import { addHistoryEntry } from '../utils/inMemoryStore';
import { RequestConfig } from '@apilot/shared';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config: RequestConfig = req.body;
    if (!config || !config.url || !config.method) {
      res.status(400).json({ error: 'url and method are required' });
      return;
    }

    const response = await executeRequest(config);

    const entry = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      request: config,
      response,
      timestamp: new Date().toISOString(),
    };
    addHistoryEntry(entry);

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
