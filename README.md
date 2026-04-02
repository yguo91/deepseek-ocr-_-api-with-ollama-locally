# DeepSeek OCR API

[![GitHub](https://img.shields.io/badge/GitHub-repo-blue)](https://github.com/yguo91/deepseek-ocr-_-api-with-ollama-locally)

A self-hosted REST API that extracts text from images using the DeepSeek OCR model running locally via [Ollama](https://ollama.com).

## Requirements

- [Node.js](https://nodejs.org) v18+
- [Ollama](https://ollama.com) running locally with the `deepseek-ocr:latest` model pulled

## Setup

1. **Clone the repo and install dependencies**

   ```bash
   git clone https://github.com/yguo91/deepseek-ocr-_-api-with-ollama-locally.git
   cd deepseek-ocr-_-api-with-ollama-locally
   npm install
   ```

2. **Create a `.env` file**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your values:

   ```env
   PORT=3000
   API_KEY=your-secret-api-key-here
   ```

3. **Start Ollama** and ensure the model is available

   ```bash
   ollama pull deepseek-ocr:latest
   ollama serve
   ```

4. **Start the server**

   ```bash
   # Production
   npm start

   # Development (auto-restarts on file changes)
   npm run dev
   ```

   The server listens on `0.0.0.0:<PORT>` by default.

## API

All endpoints except `/health` require the `x-api-key` header.

### `GET /health`

Returns `{ "status": "ok" }` — no authentication required.

### `POST /api/ocr`

Extracts text from an uploaded image.

**Headers**

| Header | Value |
|--------|-------|
| `x-api-key` | Your API key |

**Body** — `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `image` | file (JPEG / PNG / WebP, max 4 MB) | Yes |

**Success response**

```json
{
  "text": "Extracted text from the image...",
  "model": "deepseek-ocr:latest"
}
```

**Example**

```bash
curl -X POST http://localhost:3000/api/ocr \
  -H "x-api-key: <your-api-key>" \
  -F "image=@photo.jpg"
```

### Limits

| Limit | Value |
|-------|-------|
| Max file size | 4 MB |
| Accepted formats | JPEG, PNG, WebP |
| Max concurrent requests | 1 |
| Max queue depth | 5 |

Requests that exceed the queue depth are rejected with `HTTP 429`.

## Project Structure

```
.
├── src/
│   ├── index.js      # Express server entry point
│   ├── ocr.js        # /api/ocr route handler
│   ├── ollama.js     # Ollama client wrapper
│   └── queue.js      # Request queue (p-queue)
├── Client/
│   └── test.js       # Example client script
├── API_doc.md        # Full API reference
└── package.json
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |
| `API_KEY` | — | **Required.** Secret key for `x-api-key` authentication |
