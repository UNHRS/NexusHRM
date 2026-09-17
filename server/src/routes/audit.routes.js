import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
router.use(requireAuth, requireRole(['ADMIN']));
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize || 25), 1), 100);
    const where = {};
    if (req.query.targetType) where.targetType = String(req.query.targetType);
    if (req.query.actorId) where.actorId = Number(req.query.actorId);
    if (req.query.from || req.query.to) { where.createdAt = {}; if (req.query.from) where.createdAt.gte = new Date(String(req.query.from)); if (req.query.to) where.createdAt.lte = new Date(String(req.query.to)); }
    const [items, total] = await Promise.all([prisma.auditLog.findMany({ where, include: { actor: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), prisma.auditLog.count({ where })]);
    res.json({ items, total, page, pageSize, pages: Math.ceil(total / pageSize) });
  } catch (err) { next(err); }
});
export default router;
