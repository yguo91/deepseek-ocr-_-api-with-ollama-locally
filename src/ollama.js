const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'deepseek-ocr:latest';
const PROMPT = 'Read the text in this image.';

function cleanResponse(text) {
  const lines = text.split('\n');
  const seen = new Set();
  const result = [];
  for (const line of lines) {
    const trimmed = line.trimEnd();
    // Skip lines that echo back the prompt instruction
    if (trimmed.toLowerCase().includes('output only') || trimmed.toLowerCase().includes('the text is not')) continue;
    // Skip duplicate lines
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result.join('\n').trim();
}

export async function extractText(imageBuffer) {
  const base64Image = imageBuffer.toString('base64');

  let response;
  try {
    response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: PROMPT, images: [base64Image] }],
        stream: false,
        options: { num_predict: 1024 },
      }),
    });
  } catch {
    throw new Error('OLLAMA_UNREACHABLE');
  }

  if (!response.ok) {
    throw new Error(`OLLAMA_ERROR:${response.status}`);
  }

  const data = await response.json();
  const raw = data.message?.content?.trim() ?? '';
  return cleanResponse(raw);
}
