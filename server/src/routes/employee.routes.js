import bcrypt from 'bcrypt';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { prisma } from '../utils/prisma.js';
import { logAction } from '../utils/audit.js';

const router = Router();

const employeeSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  designation: z.string().min(2),
  joiningDate: z.string().min(1),
  departmentId: z.coerce.number().int(),
  managerId: z.coerce.number().int().optional().nullable(),
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
  basicSalary: z.preprocess((value) => value === '' ? undefined : value, z.coerce.number().positive().optional()),
  allowances: z.preprocess((value) => value === '' ? undefined : value, z.coerce.number().min(0).optional())
});

const profileSchema = z.object({
  phone: z.string().optional().nullable(),
  email: z.string().email().optional()
});

const include = { department: true, manager: { select: { id: true, fullName: true } }, user: { select: { username: true, role: true } }, salaryStructure: true };

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const where =
      req.user.role === 'ADMIN'
        ? {}
        : req.user.role === 'MANAGER'
          ? { managerId: req.user.employeeId }
          : { id: req.user.employeeId };
    const employees = await prisma.employee.findMany({ where, include, orderBy: { fullName: 'asc' } });
    res.json(employees);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const employee = await prisma.employee.findUnique({ where: { id }, include });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    const allowed = req.user.role === 'ADMIN' || req.user.employeeId === id || (req.user.role === 'MANAGER' && employee.managerId === req.user.employeeId);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    res.json(employee);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const body = employeeSchema.parse(req.body);
    const employee = await prisma.employee.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone || null,
        designation: body.designation,
        joiningDate: new Date(body.joiningDate),
        departmentId: body.departmentId,
        managerId: body.managerId || null
      }
    });
    if (body.basicSalary !== undefined) {
      await prisma.salaryStructure.create({ data: { employeeId: employee.id, basicSalary: body.basicSalary, allowances: body.allowances || 0, effectiveFrom: new Date() } });
    }
    if (body.username && body.password) {
      await prisma.user.create({
        data: {
          username: body.username,
          passwordHash: await bcrypt.hash(body.password, 10),
          role: body.role || 'EMPLOYEE',
          employeeId: employee.id
        }
      });
    }
    const result = await prisma.employee.findUnique({ where: { id: employee.id }, include });
    await logAction({ actorId: req.user.employeeId, action: 'EMPLOYEE_CREATED', targetType: 'Employee', targetId: employee.id });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid employee id' });
    if (req.user.role !== 'ADMIN' && req.user.employeeId !== id) return res.status(403).json({ error: 'Forbidden' });
    const data =
      req.user.role === 'ADMIN'
        ? employeeSchema.partial().parse(req.body)
        : profileSchema.parse(req.body);
    const updateData = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      designation: data.designation,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined
    };
    if (req.user.role === 'ADMIN' && data.departmentId !== undefined) {
      updateData.department = { connect: { id: data.departmentId } };
    }
    if (req.user.role === 'ADMIN' && data.managerId !== undefined) {
      updateData.manager = data.managerId ? { connect: { id: data.managerId } } : { disconnect: true };
    }
    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include
    });
    if (req.user.role === 'ADMIN' && (data.username || data.password || data.role)) {
      await prisma.user.upsert({
        where: { employeeId: id },
        update: {
          username: data.username,
          role: data.role,
          passwordHash: data.password ? await bcrypt.hash(data.password, 10) : undefined
        },
        create: {
          username: data.username || employee.email,
          passwordHash: await bcrypt.hash(data.password || 'password123', 10),
          role: data.role || 'EMPLOYEE',
          employeeId: id
        }
      });
    }
    if (req.user.role === 'ADMIN' && data.basicSalary !== undefined) {
      await prisma.salaryStructure.upsert({ where: { employeeId: id }, update: { basicSalary: data.basicSalary, allowances: data.allowances || 0 }, create: { employeeId: id, basicSalary: data.basicSalary, allowances: data.allowances || 0, effectiveFrom: new Date() } });
    }
    const result = await prisma.employee.findUnique({ where: { id }, include });
    await logAction({ actorId: req.user.employeeId, action: 'EMPLOYEE_UPDATED', targetType: 'Employee', targetId: id });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const employee = await prisma.employee.findUnique({ where: { id }, select: { id: true } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    await logAction({ actorId: req.user.employeeId, action: 'EMPLOYEE_DELETED', targetType: 'Employee', targetId: id });
    await prisma.user.deleteMany({ where: { employeeId: id } });
    await prisma.attendance.deleteMany({ where: { employeeId: id } });
    await prisma.leaveRequest.deleteMany({ where: { employeeId: id } });
    await prisma.employee.updateMany({ where: { managerId: id }, data: { managerId: null } });
    await prisma.employee.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
