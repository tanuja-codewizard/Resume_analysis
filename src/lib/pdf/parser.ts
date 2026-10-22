/**
 * PDF text extraction utility for server-side / serverless execution.
 * Uses `unpdf` which is specifically designed for serverless environments (Vercel, AWS Lambda, Cloudflare)
 * with zero native dependencies and no worker thread filesystem resolution issues.
 */

if (typeof globalThis !== 'undefined' && typeof (globalThis as Record<string, unknown>).DOMMatrix === 'undefined') {
  (globalThis as Record<string, unknown>).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}

import { extractText } from 'unpdf';

export interface PdfParseResult {
  text: string;
  numPages: number;
}

/**
 * Extracts plain text from a PDF Buffer or Uint8Array.
 *
 * @param buffer - The raw Buffer or Uint8Array of the PDF file
 * @returns Extracted plain text content
 * @throws Error with descriptive message if the file is invalid, empty, or cannot be parsed
 */
export async function extractTextFromPdf(buffer: Buffer | Uint8Array): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF file is empty. Please upload a valid PDF file.');
  }

  // Validate PDF header magic bytes (%PDF-)
  const header = Buffer.from(buffer.subarray(0, 5)).toString('utf-8');
  if (header !== '%PDF-') {
    throw new Error("The uploaded file is not a valid PDF. If it's a Word document, please upload it as .docx or export it properly to PDF.");
  }

  try {
    const uint8Data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const result = await extractText(uint8Data, { mergePages: true });
    const text = (result.text || '').trim();

    if (!text) {
      throw new Error('No readable text could be extracted from this PDF. It may be image-only, scanned, or password-protected.');
    }

    return text;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes('not a valid PDF') || errMsg.includes('No readable text')) {
      throw err;
    }
    console.warn(`PDF Parsing failed. Buffer size: ${buffer.length}. Error:`, errMsg);
    throw new Error(`Failed to parse PDF (${errMsg}). Please try a different PDF file or a simpler format.`);
  }
}
