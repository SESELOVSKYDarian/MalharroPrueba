import models from '../models/index.js';

const { Document, Media } = models;

function mapDocument(doc) {
  return {
    id: doc.id,
    titulo: doc.titulo,
    descripcion: doc.descripcion,
    archivo: doc.media
      ? {
          id: doc.media.id,
          url: doc.media.url,
          mimeType: doc.media.mimeType,
        }
      : null,
  };
}

export async function listDocuments(req, res) {
  const docs = await Document.findAll({ include: { model: Media, as: 'media' }, order: [['createdAt', 'DESC']] });
  return res.json({ data: docs.map(mapDocument) });
}

export async function createDocument(req, res) {
  const { titulo, descripcion, mediaId } = req.body;
  if (!titulo || !mediaId) return res.status(400).json({ error: 'Datos incompletos' });
  const media = await Media.findByPk(mediaId);
  if (!media) return res.status(404).json({ error: 'Archivo no encontrado' });
  const doc = await Document.create({ titulo, descripcion, mediaId });
  const created = await Document.findByPk(doc.id, { include: { model: Media, as: 'media' } });
  return res.status(201).json({ data: mapDocument(created) });
}

export async function deleteDocument(req, res) {
  const { id } = req.params;
  const doc = await Document.findByPk(id);
  if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
  await doc.destroy();
  return res.status(204).send();
}
