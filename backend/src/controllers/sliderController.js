import models from '../models/index.js';

const { Slider, Slide, Media } = models;

function mapSlide(slide) {
  return {
    id: slide.id,
    headline: slide.headline,
    body: slide.body,
    ctaLabel: slide.ctaLabel,
    ctaUrl: slide.ctaUrl,
    order: slide.order,
    mediaId: slide.mediaId,
    image: slide.media
      ? {
          id: slide.media.id,
          url: slide.media.url,
          mimeType: slide.media.mimeType,
        }
      : null,
  };
}

export async function getSlider(req, res) {
  const slider = await Slider.findOne({
    where: { slug: req.query.slug || 'principal' },
    include: {
      model: Slide,
      as: 'slides',
      include: { model: Media, as: 'media' },
      order: [['order', 'ASC']],
    },
  });

  if (!slider) {
    return res.json({ data: { id: null, title: null, slides: [] } });
  }

  const slides = slider.slides.sort((a, b) => a.order - b.order).map(mapSlide);

  return res.json({ data: { id: slider.id, slug: slider.slug, title: slider.title, slides } });
}

export async function createSlide(req, res) {
  const { sliderSlug = 'principal', headline, body, order = 0, mediaId, ctaLabel, ctaUrl } = req.body;
  if (!mediaId) return res.status(400).json({ error: 'mediaId requerido' });

  const [slider] = await Slider.findOrCreate({ where: { slug: sliderSlug }, defaults: { title: 'Carrusel principal' } });

  const media = await Media.findByPk(mediaId);
  if (!media) return res.status(404).json({ error: 'Media no encontrada' });

  const slide = await Slide.create({ sliderId: slider.id, mediaId: media.id, headline, body, order, ctaLabel, ctaUrl });
  const created = await Slide.findByPk(slide.id, { include: { model: Media, as: 'media' } });
  return res.status(201).json({ data: mapSlide(created) });
}

export async function updateSlide(req, res) {
  const { id } = req.params;
  const slide = await Slide.findByPk(id);
  if (!slide) return res.status(404).json({ error: 'Slide no encontrado' });

  const { headline, body, order, mediaId, ctaLabel, ctaUrl } = req.body;
  if (mediaId) {
    const media = await Media.findByPk(mediaId);
    if (!media) return res.status(404).json({ error: 'Media no encontrada' });
    slide.mediaId = mediaId;
  }
  if (headline !== undefined) slide.headline = headline;
  if (body !== undefined) slide.body = body;
  if (order !== undefined) slide.order = order;
  if (ctaLabel !== undefined) slide.ctaLabel = ctaLabel;
  if (ctaUrl !== undefined) slide.ctaUrl = ctaUrl;
  await slide.save();
  const updated = await Slide.findByPk(id, { include: { model: Media, as: 'media' } });
  return res.json({ data: mapSlide(updated) });
}

export async function deleteSlide(req, res) {
  const { id } = req.params;
  const slide = await Slide.findByPk(id);
  if (!slide) return res.status(404).json({ error: 'Slide no encontrado' });
  await slide.destroy();
  return res.status(204).send();
}
