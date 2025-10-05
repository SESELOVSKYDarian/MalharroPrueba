import jwt from 'jsonwebtoken';
import models from '../models/index.js';

const { User, Role } = models;

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findByPk(payload.sub, { include: { model: Role, as: 'role' } });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  if (req.user.role?.name !== 'Administrador') {
    return res.status(403).json({ error: 'Permisos insuficientes' });
  }
  return next();
}
