import { Decimal } from '@prisma/client/runtime/library';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
router.use(requireAuth);

const monthSchema = z.object({ month: z.coerce.number().int().min(1).max(12), year: z.coerce.number().int().min(2000).max(2200) });
const money = (value) => new Decimal(value).toDecimalPlaces(2);
const dateKey = (date) => date.toISOString().slice(0, 10);
const isSaturday = (date) => date.getUTCDay() === 6;

function monthDates(month, year) {
  const dates = [];
  for (let day = 1; day <= new Date(Date.UTC(year, month, 0)).getUTCDate(); day += 1) dates.push(new Date(Date.UTC(year, month - 1, day)));
  return dates;
}

function workingDates(month, year) { return monthDates(month, year).filter((date) => !isSaturday(date)); }

function overlapDates(start, end, month, year) {
  return workingDates(month, year).filter((date) => date >= start && date <= end);
}

async function calculatePayslip(employee, month, year) {
  if (!employee.salaryStructure) throw new Error(`Salary structure missing for ${employee.fullName}`);
  const dates = workingDates(month, year);
  const from = dates[0];
  const to = dates[dates.length - 1];
  const [attendance, leaves] = await Promise.all([
    prisma.attendance.findMany({ where: { employeeId: employee.id, date: { gte: from, lte: to } } }),
    prisma.leaveRequest.findMany({ where: { employeeId: employee.id, status: 'APPROVED', startDate: { lte: to }, endDate: { gte: from } } })
  ]);
  const attendanceByDate = new Map(attendance.map((row) => [dateKey(row.date), row]));
  const paidLeaveDates = new Set();
  const unpaidLeaveDates = new Set();
  for (const leave of leaves) {
    for (const date of overlapDates(leave.startDate, leave.endDate, month, year)) {
      (leave.leaveType === 'UNPAID' ? unpaidLeaveDates : paidLeaveDates).add(dateKey(date));
    }
  }
  let presentDays = 0;
  let unexplainedAbsenceDays = 0;
  let lateCount = 0;
  for (const date of dates) {
    const key = dateKey(date);
    const record = attendanceByDate.get(key);
    if (record?.status === 'PRESENT') presentDays += 1;
    if (record?.status === 'HALF_DAY') presentDays += 0.5;
    if (record?.status === 'LATE') { presentDays += 1; lateCount += 1; }
    if ((!record || record.status === 'ABSENT') && !paidLeaveDates.has(key) && !unpaidLeaveDates.has(key)) unexplainedAbsenceDays += 1;
  }
  const unpaidLeaveDays = new Decimal(unpaidLeaveDates.size + unexplainedAbsenceDays);
  const basicSalary = new Decimal(employee.salaryStructure.basicSalary);
  const allowances = new Decimal(employee.salaryStructure.allowances);
  const perDayRate = basicSalary.plus(allowances).dividedBy(dates.length);
  const lateDeduction = lateCount > 3 ? perDayRate.times(lateCount - 3).times(0.25) : new Decimal(0);
  const grossPay = basicSalary.plus(allowances);
  const totalDeductions = perDayRate.times(unpaidLeaveDays).plus(lateDeduction);
  return {
    employeeId: employee.id,
    basicSalary: money(basicSalary),
    allowances: money(allowances),
    workingDays: dates.length,
    presentDays: money(presentDays),
    unpaidLeaveDays: money(unpaidLeaveDays),
    lateDeduction: money(lateDeduction),
    grossPay: money(grossPay),
    totalDeductions: money(totalDeductions),
    netPay: money(grossPay.minus(totalDeductions))
  };
}

const runInclude = { payslips: { include: { employee: { select: { id: true, fullName: true, designation: true, department: { select: { name: true } } } } }, orderBy: { employee: { fullName: 'asc' } } } };

router.post('/generate', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { month, year } = monthSchema.parse(req.body);
    const existing = await prisma.payrollRun.findUnique({ where: { month_year: { month, year } } });
    if (existing?.status === 'FINALIZED') return res.status(409).json({ error: 'This payroll run is finalized and cannot be recalculated' });
    const employees = await prisma.employee.findMany({ include: { salaryStructure: true }, orderBy: { fullName: 'asc' } });
    const missing = employees.filter((employee) => !employee.salaryStructure).map((employee) => employee.fullName);
    if (missing.length) return res.status(400).json({ error: `Salary structure missing for: ${missing.join(', ')}` });
    const slips = [];
    for (const employee of employees) slips.push(await calculatePayslip(employee, month, year));
    const run = await prisma.$transaction(async (tx) => {
      const payrollRun = existing || await tx.payrollRun.create({ data: { month, year } });
      await tx.payslip.deleteMany({ where: { payrollRunId: payrollRun.id } });
      await tx.payslip.createMany({ data: slips.map((slip) => ({ ...slip, payrollRunId: payrollRun.id })) });
      return tx.payrollRun.findUnique({ where: { id: payrollRun.id }, include: runInclude });
    });
    res.status(existing ? 200 : 201).json(run);
  } catch (err) { next(err); }
});

router.patch('/:runId/finalize', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const run = await prisma.payrollRun.findUnique({ where: { id: Number(req.params.runId) } });
    if (!run) return res.status(404).json({ error: 'Payroll run not found' });
    if (run.status === 'FINALIZED') return res.status(409).json({ error: 'Payroll run is already finalized' });
    res.json(await prisma.payrollRun.update({ where: { id: run.id }, data: { status: 'FINALIZED' }, include: runInclude }));
  } catch (err) { next(err); }
});

router.get('/runs', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const runs = await prisma.payrollRun.findMany({ include: { _count: { select: { payslips: true } }, payslips: { select: { netPay: true } } }, orderBy: [{ year: 'desc' }, { month: 'desc' }] });
    res.json(runs.map((run) => ({ ...run, totalPayout: run.payslips.reduce((sum, slip) => sum.plus(slip.netPay), new Decimal(0)) })));
  } catch (err) { next(err); }
});

router.get('/me', requireRole(['EMPLOYEE', 'MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    res.json(await prisma.payslip.findMany({ where: { employeeId: req.user.employeeId, payrollRun: { status: 'FINALIZED' } }, include: { payrollRun: true }, orderBy: { payrollRun: { year: 'desc' } } }));
  } catch (err) { next(err); }
});

router.get('/:runId/employee/:employeeId', async (req, res, next) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (req.user.role !== 'ADMIN' && req.user.employeeId !== employeeId) return res.status(403).json({ error: 'Forbidden' });
    const payslip = await prisma.payslip.findFirst({ where: { payrollRunId: Number(req.params.runId), employeeId, ...(req.user.role === 'ADMIN' ? {} : { payrollRun: { status: 'FINALIZED' } }) }, include: { payrollRun: true, employee: true } });
    if (!payslip) return res.status(404).json({ error: 'Payslip not found' });
    res.json(payslip);
  } catch (err) { next(err); }
});

router.get('/runs/:runId', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const run = await prisma.payrollRun.findUnique({ where: { id: Number(req.params.runId) }, include: runInclude });
    if (!run) return res.status(404).json({ error: 'Payroll run not found' });
    res.json(run);
  } catch (err) { next(err); }
});

export default router;
