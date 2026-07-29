import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { todayDate } from '../utils/dates.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
router.use(requireAuth);

const include = { employee: { include: { department: true } } };

router.post('/check-in', requireRole(['EMPLOYEE', 'MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const date = todayDate();
    const existing = await prisma.attendance.findUnique({ where: { employeeId_date: { employeeId: req.user.employeeId, date } } });
    if (existing?.checkIn) return res.status(409).json({ error: 'Already checked in today' });
    const attendance = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: req.user.employeeId, date } },
      update: { checkIn: new Date(), status: 'PRESENT' },
      create: { employeeId: req.user.employeeId, date, checkIn: new Date(), status: 'PRESENT' },
      include
    });
    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
});

router.post('/check-out', requireRole(['EMPLOYEE', 'MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const date = todayDate();
    const existing = await prisma.attendance.findUnique({ where: { employeeId_date: { employeeId: req.user.employeeId, date } } });
    if (!existing?.checkIn) return res.status(400).json({ error: 'Check in before checking out' });
    if (existing.checkOut) return res.status(409).json({ error: 'Already checked out today' });
    res.json(await prisma.attendance.update({ where: { id: existing.id }, data: { checkOut: new Date() }, include }));
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    res.json(await prisma.attendance.findMany({ where: { employeeId: req.user.employeeId }, include, orderBy: { date: 'desc' } }));
  } catch (err) {
    next(err);
  }
});

router.get('/team', requireRole(['MANAGER']), async (req, res, next) => {
  try {
    res.json(await prisma.attendance.findMany({ where: { employee: { managerId: req.user.employeeId } }, include, orderBy: [{ date: 'desc' }, { employee: { fullName: 'asc' } }] }));
  } catch (err) {
    next(err);
  }
});

router.get('/all', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const where = {};
    if (req.query.employeeId) where.employeeId = Number(req.query.employeeId);
    if (req.query.from || req.query.to) {
      where.date = {};
      if (req.query.from) where.date.gte = new Date(String(req.query.from));
      if (req.query.to) where.date.lte = new Date(String(req.query.to));
    }
    res.json(await prisma.attendance.findMany({ where, include, orderBy: [{ date: 'desc' }, { employee: { fullName: 'asc' } }] }));
  } catch (err) {
    next(err);
  }
});

export default router;
