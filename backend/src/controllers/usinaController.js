import models from '../models/index.js';

const { Usina, Media } = models;

function mapUsina(item) {
  return {
    id: item.id,
    nombre: item.nombre,
    carrera: item.carrera,
    link: item.link,
    mediaId: item.mediaId,
    imagen: item.media
      ? {
          id: item.media.id,
          url: item.media.url,
        }
      : null,
  };
}

export async function listUsinas(req, res) {
  const items = await Usina.findAll({ include: { model: Media, as: 'media' }, order: [['createdAt', 'DESC']] });
  return res.json({ data: items.map(mapUsina) });
}

export async function createUsina(req, res) {
  const { nombre, carrera, link, mediaId } = req.body;
  if (!nombre || !carrera || !link || !mediaId) return res.status(400).json({ error: 'Datos incompletos' });
  const media = await Media.findByPk(mediaId);
  if (!media) return res.status(404).json({ error: 'Media no encontrada' });
  const usina = await Usina.create({ nombre, carrera, link, mediaId });
  const created = await Usina.findByPk(usina.id, { include: { model: Media, as: 'media' } });
  return res.status(201).json({ data: mapUsina(created) });
}

export async function updateUsina(req, res) {
  const { id } = req.params;
  const usina = await Usina.findByPk(id);
  if (!usina) return res.status(404).json({ error: 'Usina no encontrada' });

  const { nombre, carrera, link, mediaId } = req.body;
  if (nombre !== undefined) usina.nombre = nombre;
  if (carrera !== undefined) usina.carrera = carrera;
  if (link !== undefined) usina.link = link;
  if (mediaId) {
    const media = await Media.findByPk(mediaId);
    if (!media) return res.status(404).json({ error: 'Media no encontrada' });
    usina.mediaId = mediaId;
  }
  await usina.save();
  const updated = await Usina.findByPk(id, { include: { model: Media, as: 'media' } });
  return res.json({ data: mapUsina(updated) });
}

export async function deleteUsina(req, res) {
  const { id } = req.params;
  const usina = await Usina.findByPk(id);
  if (!usina) return res.status(404).json({ error: 'Usina no encontrada' });
  await usina.destroy();
  return res.status(204).send();
}
