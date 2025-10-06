import { Router } from 'express';
import { login, me, register } from '../controllers/authController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadMiddleware, uploadFile, listMedia } from '../controllers/mediaController.js';
import { getSlider, createSlide, updateSlide, deleteSlide } from '../controllers/sliderController.js';
import { listAgenda, createAgenda, updateAgenda, deleteAgenda } from '../controllers/agendaController.js';
import { listUsinas, createUsina, updateUsina, deleteUsina } from '../controllers/usinaController.js';
import { listDocuments, createDocument, deleteDocument } from '../controllers/documentController.js';
import { getTextByKey, listTexts, upsertText } from '../controllers/textController.js';
import { getImageByKey, listImages, upsertImage } from '../controllers/imageController.js';
import { getAccordion, upsertAccordionItem, deleteAccordionItem } from '../controllers/accordionController.js';

const router = Router();

router.post('/auth/login', login);
router.post('/auth/register', register);
router.get('/users/me', authenticate, me);

router.get('/media', authenticate, requireAdmin, listMedia);
router.post('/upload', authenticate, requireAdmin, uploadMiddleware.single('file'), uploadFile);
router.post('/media/upload', authenticate, requireAdmin, uploadMiddleware.single('file'), uploadFile);

router.get('/slider', getSlider);
router.post('/slider/slides', authenticate, requireAdmin, createSlide);
router.put('/slider/slides/:id', authenticate, requireAdmin, updateSlide);
router.delete('/slider/slides/:id', authenticate, requireAdmin, deleteSlide);

router.get('/agendas', listAgenda);
router.post('/agendas', authenticate, requireAdmin, createAgenda);
router.put('/agendas/:id', authenticate, requireAdmin, updateAgenda);
router.delete('/agendas/:id', authenticate, requireAdmin, deleteAgenda);

router.get('/usinas', listUsinas);
router.post('/usinas', authenticate, requireAdmin, createUsina);
router.put('/usinas/:id', authenticate, requireAdmin, updateUsina);
router.delete('/usinas/:id', authenticate, requireAdmin, deleteUsina);

router.get('/documentos', listDocuments);
router.post('/documentos', authenticate, requireAdmin, createDocument);
router.delete('/documentos/:id', authenticate, requireAdmin, deleteDocument);

router.get('/textos', authenticate, requireAdmin, listTexts);
router.get('/textos/:key', getTextByKey);
router.put('/textos/:key', authenticate, requireAdmin, upsertText);

router.get('/imagenes', authenticate, requireAdmin, listImages);
router.get('/imagenes/:key', getImageByKey);
router.put('/imagenes/:key', authenticate, requireAdmin, upsertImage);

router.get('/acordeones/:key', getAccordion);
router.put('/acordeones/:key', authenticate, requireAdmin, upsertAccordionItem);
router.delete('/acordeones/:key/:id', authenticate, requireAdmin, deleteAccordionItem);

export default router;
