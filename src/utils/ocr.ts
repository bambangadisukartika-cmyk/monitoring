import { createWorker } from 'tesseract.js';

export interface OcrProgress {
  status: string;
  progress: number;
}

/**
 * Perform optical character recognition locally in the browser using Tesseract.js (WASM).
 * Uses ZERO AI tokens and zero API calls.
 */
export async function recognizeImageLocally(
  imageSource: string | File | Blob,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  const worker = await createWorker(['eng', 'ind'], undefined, {
    logger: m => {
      if (onProgress && m.status) {
        onProgress({
          status: m.status,
          progress: Math.round((m.progress || 0) * 100)
        });
      }
    }
  });

  try {
    const ret = await worker.recognize(imageSource);
    await worker.terminate();
    return ret.data.text;
  } catch (error) {
    await worker.terminate();
    throw error;
  }
}
