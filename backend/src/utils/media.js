import path from 'node:path';
export function buildMediaUrl(fileName) {
  const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || 'http://localhost:4000';
  return `${baseUrl}/uploads/${fileName}`;
}

export async function extractImageDimensions(buffer) {
  try {
    const sharp = await import('sharp').then((m) => m.default).catch(() => null);
    if (!sharp) return { width: null, height: null };
    const metadata = await sharp(buffer).metadata();
    return { width: metadata.width || null, height: metadata.height || null };
  } catch {
    return { width: null, height: null };
  }
}

export function getUploadsDir() {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), 'backend', 'uploads');
}
