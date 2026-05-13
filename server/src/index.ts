import { validateEnv, env } from './config/env.js';
validateEnv();

import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import {
  adminMockPlanningBriefRouter,
  clientMockPlanningBriefRouter,
} from './routes/mock-planning-briefs.js';
import { adminTodosRouter, clientTodosRouter } from './routes/todos.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const started = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - started;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/client', clientMockPlanningBriefRouter);
app.use('/api/client', clientTodosRouter);
app.use('/api/admin', adminMockPlanningBriefRouter);
app.use('/api/admin', adminTodosRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
