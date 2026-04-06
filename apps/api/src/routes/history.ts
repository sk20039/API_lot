import { Router, Request, Response } from 'express';
import { history, clearHistory } from '../utils/inMemoryStore';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(history);
});

router.delete('/', (_req: Request, res: Response) => {
  clearHistory();
  res.json({ message: 'History cleared' });
});

export default router;
