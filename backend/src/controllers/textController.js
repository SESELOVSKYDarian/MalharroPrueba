import models from '../models/index.js';

const { TextBlock } = models;

export async function getTextByKey(req, res) {
  const { key } = req.params;
  const block = await TextBlock.findOne({ where: { textKey: key } });
  if (!block) return res.status(404).json({ error: 'Texto no encontrado' });
  return res.json({ data: { id: block.id, textKey: block.textKey, contenido: block.contenido } });
}

export async function listTexts(req, res) {
  const blocks = await TextBlock.findAll();
  return res.json({ data: blocks.map((b) => ({ id: b.id, textKey: b.textKey, contenido: b.contenido })) });
}

export async function upsertText(req, res) {
  const { key } = req.params;
  const { contenido } = req.body;
  if (typeof contenido !== 'string') return res.status(400).json({ error: 'Contenido requerido' });
  const [block] = await TextBlock.findOrCreate({ where: { textKey: key }, defaults: { contenido } });
  if (!block.isNewRecord) {
    block.contenido = contenido;
    await block.save();
  }
  return res.json({ data: { id: block.id, textKey: block.textKey, contenido: block.contenido } });
}
