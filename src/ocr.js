import { Router } from 'express';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { queue, MAX_QUEUE_SIZE } from './queue.js';
import { extractText } from './ollama.js';

const router = Router();

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 2MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

router.post('/ocr', upload.single('image'), async (req, res) => {
  // 1. Check file exists
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided. Send a file in the "image" field.' });
  }

  // 2. Validate file type by magic bytes (not just extension)
  const fileType = await fileTypeFromBuffer(req.file.buffer);
  if (!fileType || !ALLOWED_MIME_TYPES.has(fileType.mime)) {
    return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WebP are accepted.' });
  }

  // 3. Check queue capacity
  if (queue.size >= MAX_QUEUE_SIZE) {
    return res.status(429).json({ error: 'Server busy. Queue is full (max 5). Try again later.' });
  }

  // 4. Add to queue and wait for result
  try {
    const text = await queue.add(() => extractText(req.file.buffer));
    return res.json({ text, model: 'deepseek-ocr:latest' });
  } catch (err) {
    if (err.message === 'OLLAMA_UNREACHABLE') {
      return res.status(503).json({ error: 'Ollama is not reachable. Make sure it is running.' });
    }
    if (err.message.startsWith('OLLAMA_ERROR')) {
      return res.status(502).json({ error: 'Ollama returned an error. Check the model is loaded.' });
    }
    return res.status(500).json({ error: 'Failed to process image.' });
  }
});

export { router as ocrRoute };
