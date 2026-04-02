import express from 'express';
import dotenv from 'dotenv';
import { ocrRoute } from './ocr.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Fail fast if API_KEY is missing
if (!API_KEY) {
  console.error('[ERROR] API_KEY is not set. Create a .env file from .env.example');
  process.exit(1);
}

// Health check — no auth required, useful for checking if service is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API key auth for all other routes
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Provide a valid x-api-key header.' });
  }
  next();
});

app.use('/api', ocrRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Global error handler (catches multer file size error)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 4MB.' });
  }
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DeepSeek OCR API running on port ${PORT}`);
  console.log(`Endpoint: POST http://<your-ip>:${PORT}/api/ocr`);
  console.log(`Health:   GET  http://<your-ip>:${PORT}/health`);
});
