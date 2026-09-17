import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { logAction } from '../utils/audit.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
router.use(requireAuth);
const schema = z.object({ title: z.string().min(2), body: z.string().min(2), departmentId: z.coerce.number().int().positive().optional().nullable(), expiresAt: z.string().optional().nullable() });

router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const where = { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };
    if (req.user.role !== 'ADMIN') {
      where.AND = [{ OR: [{ departmentId: null }, { departmentId: req.user.employee.departmentId }] }];
    }
    res.json(await prisma.announcement.findMany({ where, include: { postedBy: { select: { fullName: true } }, department: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }));
  } catch (err) { next(err); }
});

router.post('/', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const announcement = await prisma.announcement.create({ data: { title: body.title, body: body.body, postedById: req.user.employeeId, departmentId: body.departmentId || null, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }, include: { department: true } });
    await logAction({ actorId: req.user.employeeId, action: 'ANNOUNCEMENT_CREATED', targetType: 'Announcement', targetId: announcement.id });
    res.status(201).json(announcement);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try { const id = Number(req.params.id); await prisma.announcement.delete({ where: { id } }); await logAction({ actorId: req.user.employeeId, action: 'ANNOUNCEMENT_DELETED', targetType: 'Announcement', targetId: id }); res.json({ ok: true }); }
  catch (err) { next(err); }
});

export default router;
