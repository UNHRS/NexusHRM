import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { todayDate } from '../utils/dates.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'MANAGER']));

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

export default router;
