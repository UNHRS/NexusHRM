import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { todayDate } from '../utils/dates.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'MANAGER']));

function trendPeriods(months) {
  const parsed = Number(months);
  const count = Math.min(Math.max(Number.isInteger(parsed) ? parsed : 6, 1), 12);
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - index - 1), 1));
    return { month: date.getUTCMonth() + 1, year: date.getUTCFullYear(), from: date, to: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)) };
  });
}

function departmentFilter(req) {
  if (req.user.role === 'MANAGER') return { managerId: req.user.employeeId };
  return req.query.departmentId ? { departmentId: Number(req.query.departmentId) } : {};
}

router.get('/payroll-trend', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const periods = trendPeriods(req.query.months);
    const runs = await prisma.payrollRun.findMany({ where: { status: 'FINALIZED', OR: periods.map(({ month, year }) => ({ month, year })) }, include: { payslips: { include: { employee: { select: { departmentId: true } } } } }, orderBy: [{ year: 'asc' }, { month: 'asc' }] });
    const departmentId = req.query.departmentId ? Number(req.query.departmentId) : null;
    res.json(runs.map((run) => {
      const slips = departmentId ? run.payslips.filter((slip) => slip.employee.departmentId === departmentId) : run.payslips;
      return { month: run.month, year: run.year, totalGross: sumDecimal(slips.map((slip) => slip.grossPay)), totalDeductions: sumDecimal(slips.map((slip) => slip.totalDeductions)), totalNetPay: sumDecimal(slips.map((slip) => slip.netPay)), employeeCount: slips.length };
    }));
  } catch (err) { next(err); }
});

router.get('/leave-trend', async (req, res, next) => {
  try {
    const periods = trendPeriods(req.query.months);
    const employeeWhere = departmentFilter(req);
    const leaves = await prisma.leaveRequest.findMany({ where: { status: 'APPROVED', employee: employeeWhere, startDate: { lt: periods.at(-1).to }, endDate: { gte: periods[0].from } } });
    res.json(periods.flatMap((period) => {
      const grouped = {};
      for (const leave of leaves.filter((item) => item.startDate < period.to && item.endDate >= period.from)) {
        const start = new Date(Math.max(leave.startDate.getTime(), period.from.getTime()));
        const end = new Date(Math.min(leave.endDate.getTime(), period.to.getTime() - 86400000));
        const days = Math.max(0, Math.floor((end - start) / 86400000) + 1);
        grouped[leave.leaveType] = (grouped[leave.leaveType] || 0) + days;
      }
      return Object.entries(grouped).map(([leaveType, totalDays]) => ({ month: period.month, year: period.year, leaveType, totalDays }));
    }));
  } catch (err) { next(err); }
});

router.get('/attendance-trend', async (req, res, next) => {
  try {
    const periods = trendPeriods(req.query.months);
    const employeeWhere = departmentFilter(req);
    const rows = await prisma.attendance.findMany({ where: { employee: employeeWhere, date: { gte: periods[0].from, lt: periods.at(-1).to } } });
    res.json(periods.map((period) => {
      const monthRows = rows.filter((row) => row.date >= period.from && row.date < period.to);
      const total = monthRows.length || 1;
      return { month: period.month, year: period.year, presentPct: Math.round((monthRows.filter((row) => row.status === 'PRESENT' || row.status === 'HALF_DAY').length / total) * 100), absentPct: Math.round((monthRows.filter((row) => row.status === 'ABSENT').length / total) * 100), latePct: Math.round((monthRows.filter((row) => row.status === 'LATE').length / total) * 100) };
    }));
  } catch (err) { next(err); }
});

router.get('/overview', async (req, res, next) => {
  try {
    const today = todayDate();
    const teamFilter = req.user.role === 'MANAGER' ? { managerId: req.user.employeeId } : {};
    const employeeWhere = req.user.role === 'MANAGER' ? { managerId: req.user.employeeId } : {};
    const attendanceWhere = req.user.role === 'MANAGER' ? { employee: { managerId: req.user.employeeId } } : {};
    const leaveWhere = req.user.role === 'MANAGER' ? { employee: { managerId: req.user.employeeId } } : {};

    const [employees, departments, attendance, todayAttendance, leaves, jobs, candidates] = await Promise.all([
      prisma.employee.findMany({ where: employeeWhere, include: { department: true } }),
      prisma.department.findMany({ include: { employees: true } }),
      prisma.attendance.findMany({ where: attendanceWhere, include: { employee: { include: { department: true } } } }),
      prisma.attendance.findMany({ where: { ...attendanceWhere, date: today }, include: { employee: true } }),
      prisma.leaveRequest.findMany({ where: leaveWhere, include: { employee: { include: { department: true } } } }),
      prisma.jobOpening.findMany({ include: { department: true, candidates: true } }),
      prisma.candidate.findMany({ include: { jobOpening: { include: { department: true } } } })
    ]);

    const scopedDepartments = req.user.role === 'MANAGER'
      ? groupCount(employees, (employee) => employee.department.name)
      : Object.fromEntries(departments.map((department) => [department.name, department.employees.length]));

    res.json({
      scope: req.user.role === 'MANAGER' ? 'TEAM' : 'COMPANY',
      headcount: employees.length,
      departments: scopedDepartments,
      attendance: {
        todayPresent: todayAttendance.filter((row) => row.checkIn).length,
        todayTotal: employees.length,
        status: groupCount(attendance, (row) => row.status)
      },
      leave: {
        pending: leaves.filter((leave) => leave.status === 'PENDING').length,
        approved: leaves.filter((leave) => leave.status === 'APPROVED').length,
        rejected: leaves.filter((leave) => leave.status === 'REJECTED').length,
        byType: groupCount(leaves, (leave) => leave.leaveType)
      },
      recruitment: {
        openJobs: jobs.filter((job) => job.status === 'OPEN').length,
        totalCandidates: candidates.length,
        byStage: groupCount(candidates, (candidate) => candidate.stage),
        byDepartment: groupCount(jobs, (job) => job.department.name)
      }
    });
  } catch (err) {
    next(err);
  }
});

function groupCount(rows, getKey) {
  return rows.reduce((acc, row) => {
    const key = getKey(row) || 'Unassigned';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sumDecimal(values) {
  return values.reduce((sum, value) => sum.plus(value), new (values[0]?.constructor || Number)(0)).toString();
}

export default router;
