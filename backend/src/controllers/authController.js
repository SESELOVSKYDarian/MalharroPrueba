import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import models from '../models/index.js';

const { User, Role } = models;

function signToken(user) {
  const payload = { sub: user.id, role: user.role?.name };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'El email ya está registrado' });

    const role = await Role.findOne({ where: { name: 'Editor' } });
    if (!role) return res.status(500).json({ error: 'Rol por defecto no encontrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash, roleId: role.id });
    await user.reload({ include: { model: Role, as: 'role' } });

    const token = signToken(user);
    return res.json({ jwt: token, user: { id: user.id, username: user.username, email: user.email, role: user.role.name } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { identifier, email, password } = req.body;
    const where = identifier
      ? {
          [Op.or]: [
            { email: identifier },
            { username: identifier },
          ],
        }
      : { email: email || identifier };

    const user = await User.findOne({
      where,
      include: { model: Role, as: 'role' },
    });

    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = signToken(user);
    return res.json({ jwt: token, user: { id: user.id, username: user.username, email: user.email, role: user.role.name } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function me(req, res) {
  const user = req.user;
  return res.json({ id: user.id, username: user.username, email: user.email, nombre: user.username, role: user.role?.name });
}
