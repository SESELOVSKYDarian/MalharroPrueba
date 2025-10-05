import express from 'express';
import cors from 'cors';
import path from 'node:path';
import router from './routes/index.js';
import { getUploadsDir } from './utils/media.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const uploadsDir = getUploadsDir();
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', router);

app.use((err, req, res, next) => {
  console.error(err); // eslint-disable-line no-console
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

export default app;
