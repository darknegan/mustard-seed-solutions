import { validateEnv, env } from './config/env.js';
validateEnv();

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
