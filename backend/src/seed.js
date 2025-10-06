import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { sequelize } from './models/index.js';
import models from './models/index.js';

const {
  Role,
  User,
  Media,
  Slider,
  Slide,
  TextBlock,
  AgendaItem,
  Usina,
  Document,
  Accordion,
  AccordionItem,
  ImageAsset,
} = models;

dotenv.config();

async function seed() {
  await sequelize.sync({ force: true });

  const [adminRole, editorRole] = await Promise.all([
    Role.create({ name: 'Administrador' }),
    Role.create({ name: 'Editor' }),
  ]);

  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await User.create({
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@malharro.edu.ar',
    passwordHash: adminPassword,
    roleId: adminRole.id,
  });

  const heroMedia = await Media.bulkCreate([
    {
      originalName: 'slide-1.jpg',
      fileName: 'slide-1.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
      kind: 'image',
    },
    {
      originalName: 'slide-2.jpg',
      fileName: 'slide-2.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
      kind: 'image',
    },
    {
      originalName: 'slide-3.jpg',
      fileName: 'slide-3.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      kind: 'image',
    },
  ]);

  const slider = await Slider.create({ slug: 'principal', title: 'Bienvenidos a la Escuela de Artes Visuales Martín Malharro' });
  await Slide.bulkCreate([
    {
      sliderId: slider.id,
      mediaId: heroMedia[0].id,
      headline: 'Convocatoria abierta 2025',
      body: 'Explorá nuestras propuestas académicas y sé parte de la próxima cohorte.',
      order: 0,
    },
    {
      sliderId: slider.id,
      mediaId: heroMedia[1].id,
      headline: 'Residencias y talleres',
      body: 'Programas para potenciar tu producción artística.',
      order: 1,
    },
    {
      sliderId: slider.id,
      mediaId: heroMedia[2].id,
      headline: 'Usina de proyectos',
      body: 'Acompañamos a estudiantes y graduados en la concreción de ideas.',
      order: 2,
    },
  ]);

  await TextBlock.bulkCreate([
    {
      textKey: 'texto-introduccion',
      contenido: 'Somos un instituto público dedicado a la formación integral en artes visuales, diseño y comunicación.',
    },
    {
      textKey: 'texto-introduccion2',
      contenido: 'Nuestra comunidad educativa impulsa proyectos interdisciplinarios junto a instituciones locales e internacionales.',
    },
  ]);

  const agendaMedia = await Media.bulkCreate([
    {
      originalName: 'agenda-1.jpg',
      fileName: 'agenda-1.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
      kind: 'image',
    },
    {
      originalName: 'agenda-2.jpg',
      fileName: 'agenda-2.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
      kind: 'image',
    },
  ]);

  await AgendaItem.bulkCreate([
    {
      tituloActividad: 'Jornada de Puertas Abiertas',
      contenidoActividad: 'Visitas guiadas, charlas con docentes y muestra de talleres.',
      fecha: '12 NOV',
      mediaId: agendaMedia[0].id,
    },
    {
      tituloActividad: 'Charla: Diseño sustentable',
      contenidoActividad: 'Invitada especial: Arq. Ana Valdez. Auditorio principal.',
      fecha: '28 NOV',
      mediaId: agendaMedia[1].id,
    },
  ]);

  const usinaMedia = await Media.bulkCreate([
    {
      originalName: 'usina-1.jpg',
      fileName: 'usina-1.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      url: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe',
      kind: 'image',
    },
    {
      originalName: 'usina-2.jpg',
      fileName: 'usina-2.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
      kind: 'image',
    },
  ]);

  await Usina.bulkCreate([
    {
      nombre: 'Lucía Herrera',
      carrera: 'Diseño Gráfico',
      link: 'https://www.behance.net/',
      mediaId: usinaMedia[0].id,
    },
    {
      nombre: 'Federico Álvarez',
      carrera: 'Fotografía',
      link: 'https://www.instagram.com/',
      mediaId: usinaMedia[1].id,
    },
  ]);

  const docMedia = await Media.create({
    originalName: 'plan-estudios.pdf',
    fileName: 'plan-estudios.pdf',
    mimeType: 'application/pdf',
    size: 1000,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    kind: 'document',
  });

  await Document.create({ titulo: 'Plan de estudios 2025', descripcion: 'Descargá el plan completo.', mediaId: docMedia.id });

  const accordion = await Accordion.create({ accordionKey: 'carreras', titulo: 'Carreras disponibles' });
  await AccordionItem.bulkCreate([
    { accordionId: accordion.id, titulo: 'Diseño Gráfico', contenido: 'Tecnicatura con orientación editorial.', color: '#F5F5F5', order: 0 },
    { accordionId: accordion.id, titulo: 'Fotografía', contenido: 'Formación profesional en producción fotográfica.', color: '#EFEFEF', order: 1 },
    { accordionId: accordion.id, titulo: 'Medios Audiovisuales', contenido: 'Carrera orientada a producción audiovisual integral.', color: '#E8E8E8', order: 2 },
  ]);

  const logoMedia = await Media.create({
    originalName: 'logo.svg',
    fileName: 'logo.svg',
    mimeType: 'image/svg+xml',
    size: 500,
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Roundel_of_Argentina.svg',
    kind: 'image',
  });

  await ImageAsset.create({ imageKey: 'logo', mediaId: logoMedia.id, altText: 'Logo Malharro' });

  console.log('Datos iniciales cargados');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
