import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import { extractImageDimensions, buildMediaUrl, getUploadsDir } from '../utils/media.js';
import models from '../models/index.js';

const { Media } = models;

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage });

export async function uploadFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });

    const uploadsDir = getUploadsDir();
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(req.file.originalname) || '';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, req.file.buffer);

    let width = null;
    let height = null;
    const kind = req.file.mimetype.startsWith('image/') ? 'image' : 'document';
    if (kind === 'image') {
      const dims = await extractImageDimensions(req.file.buffer);
      width = dims.width;
      height = dims.height;
    }

    const media = await Media.create({
      originalName: req.file.originalname,
      fileName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: buildMediaUrl(fileName),
      kind,
      width,
      height,
    });

    return res.json({
      data: {
        id: media.id,
        url: media.url,
        mimeType: media.mimeType,
        kind: media.kind,
        size: media.size,
        width: media.width,
        height: media.height,
        originalName: media.originalName,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function listMedia(req, res) {
  const items = await Media.findAll();
  return res.json({ data: items });
}
