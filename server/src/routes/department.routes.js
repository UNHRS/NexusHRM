import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
const schema = z.object({ name: z.string().min(2) });

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.department.findMany({ include: { _count: { select: { employees: true } } }, orderBy: { name: 'asc' } }));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    res.status(201).json(await prisma.department.create({ data: schema.parse(req.body) }));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    res.json(await prisma.department.update({ where: { id: Number(req.params.id) }, data: schema.parse(req.body) }));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    await prisma.department.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
