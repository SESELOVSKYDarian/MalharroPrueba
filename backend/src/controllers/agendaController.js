import models from '../models/index.js';

const { AgendaItem, Media } = models;

function mapAgenda(item) {
  return {
    id: item.id,
    tituloActividad: item.tituloActividad,
    contenidoActividad: item.contenidoActividad,
    fecha: item.fecha,
    mediaId: item.mediaId,
    imagen: item.media
      ? {
          id: item.media.id,
          url: item.media.url,
        }
      : null,
  };
}

export async function listAgenda(req, res) {
  const items = await AgendaItem.findAll({ include: { model: Media, as: 'media' }, order: [['createdAt', 'DESC']] });
  return res.json({ data: items.map(mapAgenda) });
}

export async function createAgenda(req, res) {
  const { tituloActividad, contenidoActividad, fecha, mediaId } = req.body;
  if (!tituloActividad || !fecha || !mediaId) return res.status(400).json({ error: 'Datos incompletos' });
  const media = await Media.findByPk(mediaId);
  if (!media) return res.status(404).json({ error: 'Media no encontrada' });
  const item = await AgendaItem.create({ tituloActividad, contenidoActividad, fecha, mediaId });
  const created = await AgendaItem.findByPk(item.id, { include: { model: Media, as: 'media' } });
  return res.status(201).json({ data: mapAgenda(created) });
}

export async function updateAgenda(req, res) {
  const { id } = req.params;
  const item = await AgendaItem.findByPk(id);
  if (!item) return res.status(404).json({ error: 'Agenda no encontrada' });

  const { tituloActividad, contenidoActividad, fecha, mediaId } = req.body;
  if (tituloActividad !== undefined) item.tituloActividad = tituloActividad;
  if (contenidoActividad !== undefined) item.contenidoActividad = contenidoActividad;
  if (fecha !== undefined) item.fecha = fecha;
  if (mediaId) {
    const media = await Media.findByPk(mediaId);
    if (!media) return res.status(404).json({ error: 'Media no encontrada' });
    item.mediaId = mediaId;
  }
  await item.save();
  const updated = await AgendaItem.findByPk(id, { include: { model: Media, as: 'media' } });
  return res.json({ data: mapAgenda(updated) });
}

export async function deleteAgenda(req, res) {
  const { id } = req.params;
  const item = await AgendaItem.findByPk(id);
  if (!item) return res.status(404).json({ error: 'Agenda no encontrada' });
  await item.destroy();
  return res.status(204).send();
}
