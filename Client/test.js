import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, basename } from 'path';

const SERVER_URL = process.env.SERVER_URL;
const API_KEY = process.env.API_KEY;

const imagePath = process.argv[2];

if (!imagePath) {
  console.error('Usage: node test.js <path-to-image>');
  console.error('Example: node test.js ./sample.jpg');
  process.exit(1);
}

async function healthCheck() {
  const res = await fetch(`${SERVER_URL}/health`);
  const data = await res.json();
  console.log('Health check:', data);
}

async function ocrRequest(filePath) {
  const buffer = readFileSync(resolve(filePath));
  const form = new FormData();
  form.append('image', new Blob([buffer]), basename(filePath));

  console.log(`Sending "${basename(filePath)}" to OCR...`);

  const res = await fetch(`${SERVER_URL}/api/ocr`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY },
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`Error ${res.status}:`, data);
    process.exit(1);
  }

  console.log('\n--- OCR Result ---');
  if (data.text && data.text.length > 0) {
    console.log(data.text);
  } else {
    console.log('(No text detected — make sure the image contains readable text)');
  }
  console.log('------------------');
  console.log('Model :', data.model);
  console.log('Chars  :', data.text?.length ?? 0);
}

await healthCheck();
await ocrRequest(imagePath);
