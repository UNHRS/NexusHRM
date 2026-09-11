import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { toDateOnly } from '../utils/dates.js';
import { prisma } from '../utils/prisma.js';
import { logAction } from '../utils/audit.js';

const router = Router();
router.use(requireAuth);

const schema = z.object({
  leaveType: z.enum(['SICK', 'CASUAL', 'ANNUAL', 'UNPAID']),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().optional().nullable()
});
const include = { employee: { include: { department: true, manager: true } } };

router.post('/', requireRole(['EMPLOYEE', 'MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const startDate = toDateOnly(body.startDate);
    const endDate = toDateOnly(body.endDate);
    if (endDate < startDate) return res.status(400).json({ error: 'End date must be after start date' });
    res.status(201).json(await prisma.leaveRequest.create({
      data: { employeeId: req.user.employeeId, leaveType: body.leaveType, startDate, endDate, reason: body.reason || null },
      include
    }));
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    res.json(await prisma.leaveRequest.findMany({ where: { employeeId: req.user.employeeId }, include, orderBy: { createdAt: 'desc' } }));
  } catch (err) {
    next(err);
  }
});

router.get('/pending', requireRole(['MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    const where = req.user.role === 'ADMIN' ? { status: 'PENDING' } : { status: 'PENDING', employee: { managerId: req.user.employeeId } };
    res.json(await prisma.leaveRequest.findMany({ where, include, orderBy: { createdAt: 'asc' } }));
  } catch (err) {
    next(err);
  }
});

async function decide(req, res, next, status) {
  try {
    const leave = await prisma.leaveRequest.findUnique({ where: { id: Number(req.params.id) }, include });
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    const allowed = req.user.role === 'ADMIN' || (req.user.role === 'MANAGER' && leave.employee.managerId === req.user.employeeId);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    const updated = await prisma.leaveRequest.update({ where: { id: leave.id }, data: { status, approvedBy: req.user.employeeId }, include });
    await logAction({ actorId: req.user.employeeId, action: status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED', targetType: 'LeaveRequest', targetId: leave.id, metadata: { previousStatus: leave.status } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

router.patch('/:id/approve', requireRole(['MANAGER', 'ADMIN']), (req, res, next) => decide(req, res, next, 'APPROVED'));
router.patch('/:id/reject', requireRole(['MANAGER', 'ADMIN']), (req, res, next) => decide(req, res, next, 'REJECTED'));

router.get('/all', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    res.json(await prisma.leaveRequest.findMany({ include, orderBy: { createdAt: 'desc' } }));
  } catch (err) {
    next(err);
  }
});

export default router;
