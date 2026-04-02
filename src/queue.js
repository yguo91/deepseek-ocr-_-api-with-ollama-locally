import PQueue from 'p-queue';

// concurrency: 1 → only 1 request runs at a time (Ollama limitation)
// MAX_QUEUE_SIZE: 5 → up to 5 more requests can wait; 6th gets rejected
export const queue = new PQueue({ concurrency: 1 });
export const MAX_QUEUE_SIZE = 5;
