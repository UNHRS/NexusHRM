import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
router.use(requireAuth);
const schema = z.object({ name: z.string().min(2), date: z.string().min(10) });

router.get('/', async (req, res, next) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getUTCFullYear();
    res.json(await prisma.holiday.findMany({ where: { year }, orderBy: { date: 'asc' } }));
  } catch (err) { next(err); }
});

router.post('/', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const date = new Date(`${body.date}T00:00:00.000Z`);
    res.status(201).json(await prisma.holiday.create({ data: { name: body.name, date, year: date.getUTCFullYear() } }));
  } catch (err) { next(err); }
});

router.put('/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const date = new Date(`${body.date}T00:00:00.000Z`);
    res.json(await prisma.holiday.update({ where: { id: Number(req.params.id) }, data: { name: body.name, date, year: date.getUTCFullYear() } }));
  } catch (err) { next(err); }
});

router.delete('/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try { await prisma.holiday.delete({ where: { id: Number(req.params.id) } }); res.json({ ok: true }); }
  catch (err) { next(err); }
});

export default router;
