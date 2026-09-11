import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { logAction } from '../utils/audit.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
router.use(requireAuth);
const documentTypes = ['CITIZENSHIP', 'PASSPORT', 'CONTRACT', 'OFFER_LETTER', 'WORK_PERMIT', 'OTHER'];
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const directory = path.resolve('uploads', 'documents', String(req.params.id));
    fs.mkdirSync(directory, { recursive: true });
    callback(null, directory);
  },
  filename: (req, file, callback) => callback(null, `${Date.now()}-${path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_')}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function canReadEmployee(req, employeeId) { return req.user.role === 'ADMIN' || req.user.employeeId === employeeId; }

router.post('/employees/:id/documents', requireRole(['ADMIN']), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'A document file is required' });
    const docType = z.enum(documentTypes).parse(req.body.docType);
    const employeeId = Number(req.params.id);
    const document = await prisma.employeeDocument.create({ data: { employeeId, docType, fileName: req.file.originalname, filePath: path.relative(process.cwd(), req.file.path), expiryDate: req.body.expiryDate ? new Date(`${req.body.expiryDate}T00:00:00.000Z`) : null } });
    await logAction({ actorId: req.user.employeeId, action: 'DOCUMENT_UPLOADED', targetType: 'EmployeeDocument', targetId: document.id, metadata: { employeeId, docType } });
    res.status(201).json(document);
  } catch (err) { next(err); }
});

router.get('/employees/:id/documents', async (req, res, next) => {
  try {
    const employeeId = Number(req.params.id);
    if (!canReadEmployee(req, employeeId)) return res.status(403).json({ error: 'Forbidden' });
    res.json(await prisma.employeeDocument.findMany({ where: { employeeId }, orderBy: { uploadedAt: 'desc' } }));
  } catch (err) { next(err); }
});

router.get('/documents/:id/download', async (req, res, next) => {
  try {
    const document = await prisma.employeeDocument.findUnique({ where: { id: Number(req.params.id) } });
    if (!document) return res.status(404).json({ error: 'Document not found' });
    if (!canReadEmployee(req, document.employeeId)) return res.status(403).json({ error: 'Forbidden' });
    const filePath = path.resolve(document.filePath);
    if (!filePath.startsWith(path.resolve('uploads', 'documents') + path.sep) || !fs.existsSync(filePath)) return res.status(404).json({ error: 'Stored file not found' });
    res.download(filePath, document.fileName);
  } catch (err) { next(err); }
});

router.delete('/documents/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const document = await prisma.employeeDocument.findUnique({ where: { id: Number(req.params.id) } });
    if (!document) return res.status(404).json({ error: 'Document not found' });
    await prisma.employeeDocument.delete({ where: { id: document.id } });
    const filePath = path.resolve(document.filePath);
    if (filePath.startsWith(path.resolve('uploads', 'documents') + path.sep)) fs.rmSync(filePath, { force: true });
    await logAction({ actorId: req.user.employeeId, action: 'DOCUMENT_DELETED', targetType: 'EmployeeDocument', targetId: document.id });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.get('/documents/expiring', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const until = new Date(today); until.setUTCDate(until.getUTCDate() + days);
    res.json(await prisma.employeeDocument.findMany({ where: { expiryDate: { gte: today, lte: until } }, include: { employee: { select: { id: true, fullName: true, department: { select: { name: true } } } } }, orderBy: { expiryDate: 'asc' } }));
  } catch (err) { next(err); }
});

export default router;
