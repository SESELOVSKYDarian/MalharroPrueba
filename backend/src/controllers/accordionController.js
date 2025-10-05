import models from '../models/index.js';

const { Accordion, AccordionItem } = models;

function mapItem(item) {
  return {
    id: item.id,
    titulo: item.titulo,
    contenido: item.contenido,
    color: item.color,
    order: item.order,
  };
}

export async function getAccordion(req, res) {
  const { key } = req.params;
  const accordion = await Accordion.findOne({
    where: { accordionKey: key },
    include: { model: AccordionItem, as: 'items' },
  });
  if (!accordion) return res.status(404).json({ error: 'Acordeón no encontrado' });
  const items = accordion.items.sort((a, b) => a.order - b.order).map(mapItem);
  return res.json({ data: { id: accordion.id, accordionKey: accordion.accordionKey, titulo: accordion.titulo, items } });
}

export async function upsertAccordionItem(req, res) {
  const { key } = req.params;
  const { id, titulo, contenido, color, order = 0 } = req.body;

  const [accordion] = await Accordion.findOrCreate({ where: { accordionKey: key }, defaults: { titulo: key } });

  let item;
  if (id) {
    item = await AccordionItem.findOne({ where: { id, accordionId: accordion.id } });
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    if (titulo !== undefined) item.titulo = titulo;
    if (contenido !== undefined) item.contenido = contenido;
    if (color !== undefined) item.color = color;
    if (order !== undefined) item.order = order;
    await item.save();
  } else {
    item = await AccordionItem.create({ accordionId: accordion.id, titulo, contenido, color, order });
  }

  return res.json({ data: mapItem(item) });
}

export async function deleteAccordionItem(req, res) {
  const { key, id } = req.params;
  const accordion = await Accordion.findOne({ where: { accordionKey: key } });
  if (!accordion) return res.status(404).json({ error: 'Acordeón no encontrado' });
  const item = await AccordionItem.findOne({ where: { id, accordionId: accordion.id } });
  if (!item) return res.status(404).json({ error: 'Item no encontrado' });
  await item.destroy();
  return res.status(204).send();
}
