/**
 * Receipt OCR — 100% free, runs on-device in the browser (Tesseract.js WASM).
 * No API key, no billing, no network calls after the language data loads once.
 * OCR is an assist: the admin always reviews/edits extracted values before saving.
 */

export interface ReceiptScan {
  text: string;
  confidence: number; // 0-100
  amount?: number;
  date?: string; // YYYY-MM-DD
  vendor?: string;
  invoiceNo?: string;
}

/** Downscale an image file to a compact JPEG data URL (for Firestore doc storage). */
export function downscaleImage(file: File, maxDim = 1024, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('no canvas');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('bad image'));
    };
    img.src = url;
  });
}

function parseAmount(text: string): number | undefined {
  // Prefer numbers near total/amount keywords, else the largest money-like number.
  const near = [...text.matchAll(/(?:total|grand total|amount|net payable|balance|rs\.?|inr|₹)[\s:]*([\d,]{1,3}(?:,[\d]{2,3})*(?:\.\d{1,2})?)/gi)]
    .map((m) => Number(m[1].replace(/,/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (near.length > 0) return Math.max(...near);
  const all = [...text.matchAll(/([\d,]{1,3}(?:,[\d]{2,3})+(?:\.\d{1,2})?|\d+\.\d{2})/g)]
    .map((m) => Number(m[1].replace(/,/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 10000000);
  return all.length > 0 ? Math.max(...all) : undefined;
}

function parseDate(text: string): string | undefined {
  // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (Indian bills)
  const m = text.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!m) return undefined;
  let [, d, mo, y] = m;
  if (y.length === 2) y = (Number(y) > 50 ? '19' : '20') + y;
  const dd = d.padStart(2, '0');
  const mm = mo.padStart(2, '0');
  if (Number(mm) < 1 || Number(mm) > 12 || Number(dd) < 1 || Number(dd) > 31) return undefined;
  return `${y}-${mm}-${dd}`;
}

function parseVendor(text: string): string | undefined {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/[|_~^`]+/g, '').trim())
    .filter((l) => /[A-Za-z]{3,}/.test(l) && l.length >= 4 && l.length <= 60);
  // Skip lines that look like addresses/phones/gst noise at the very top? Keep it simple:
  // first plausible business-name line.
  return lines[0];
}

function parseInvoice(text: string): string | undefined {
  const m = text.match(
    /(?:bill|invoice|receipt)[\s]*(?:no|number|#)?[\s:]*([A-Za-z0-9][A-Za-z0-9\-/]{1,24})/i,
  );
  const cleaned = m?.[1].replace(/[:\s]+$/, '');
  return cleaned || undefined;
}

/** Run OCR on an image data URL. Lazy-loads tesseract.js on first use. */
export async function scanReceipt(
  imageDataUrl: string,
  onProgress?: (pct: number) => void,
): Promise<ReceiptScan> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', undefined, {
    logger: (m: { status: string; progress?: number }) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.(Math.round(m.progress * 100));
      }
    },
  });
  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(imageDataUrl);
    return {
      text: text.trim(),
      confidence: Math.round(confidence),
      amount: parseAmount(text),
      date: parseDate(text),
      vendor: parseVendor(text),
      invoiceNo: parseInvoice(text),
    };
  } finally {
    await worker.terminate();
  }
}
