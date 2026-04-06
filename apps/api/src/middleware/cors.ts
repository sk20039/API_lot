import cors from 'cors';

const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:5173';

export const corsMiddleware = cors({
  origin: WEB_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
