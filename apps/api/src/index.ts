import 'dotenv/config';
import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import proxyRouter from './routes/proxy';
import historyRouter from './routes/history';
import aiRouter from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRouter);
app.use('/api/proxy', proxyRouter);
app.use('/api/history', historyRouter);
app.use('/api/ai', aiRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`APIlot API server running on http://localhost:${PORT}`);
});

export default app;
