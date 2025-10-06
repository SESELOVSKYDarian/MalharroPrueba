import models from '../models/index.js';

const { ImageAsset, Media } = models;

export async function getImageByKey(req, res) {
  const { key } = req.params;
  const asset = await ImageAsset.findOne({ where: { imageKey: key }, include: { model: Media, as: 'media' } });
  if (!asset) return res.status(404).json({ error: 'Imagen no encontrada' });
  return res.json({
    data: {
      id: asset.id,
      imageKey: asset.imageKey,
      altText: asset.altText,
      url: asset.media?.url,
      mediaId: asset.mediaId,
    },
  });
}

export async function listImages(req, res) {
  const items = await ImageAsset.findAll({ include: { model: Media, as: 'media' } });
  return res.json({
    data: items.map((asset) => ({
      id: asset.id,
      imageKey: asset.imageKey,
      altText: asset.altText,
      url: asset.media?.url,
      mediaId: asset.mediaId,
    })),
  });
}

export async function upsertImage(req, res) {
  const { key } = req.params;
  const { mediaId, altText } = req.body;
  if (!mediaId) return res.status(400).json({ error: 'mediaId requerido' });

  const asset = await ImageAsset.findOne({ where: { imageKey: key } });
  if (asset) {
    asset.mediaId = mediaId;
    asset.altText = altText;
    await asset.save();
    const updated = await ImageAsset.findByPk(asset.id, { include: { model: Media, as: 'media' } });
    return res.json({
      data: {
        id: updated.id,
        imageKey: updated.imageKey,
        altText: updated.altText,
        url: updated.media?.url,
        mediaId: updated.mediaId,
      },
    });
  }

  const created = await ImageAsset.create({ imageKey: key, mediaId, altText });
  const withMedia = await ImageAsset.findByPk(created.id, { include: { model: Media, as: 'media' } });
  return res.status(201).json({
    data: {
      id: withMedia.id,
      imageKey: withMedia.imageKey,
      altText: withMedia.altText,
      url: withMedia.media?.url,
      mediaId: withMedia.mediaId,
    },
  });
}
