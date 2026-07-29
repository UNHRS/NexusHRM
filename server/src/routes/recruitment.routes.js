import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'MANAGER']));

const jobSchema = z.object({
  title: z.string().min(2),
  departmentId: z.coerce.number().int(),
  location: z.string().min(2),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).default('FULL_TIME'),
  status: z.enum(['OPEN', 'ON_HOLD', 'CLOSED']).default('OPEN'),
  description: z.string().optional().nullable()
});

const candidateSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  stage: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']).default('APPLIED'),
  jobOpeningId: z.coerce.number().int(),
  notes: z.string().optional().nullable()
});

const jobInclude = { department: true, _count: { select: { candidates: true } } };
const candidateInclude = { jobOpening: { include: { department: true } } };

router.get('/summary', async (req, res, next) => {
  try {
    const [jobs, candidates] = await Promise.all([
      prisma.jobOpening.findMany({ include: { candidates: true } }),
      prisma.candidate.findMany()
    ]);
    res.json({
      openJobs: jobs.filter((job) => job.status === 'OPEN').length,
      totalCandidates: candidates.length,
      interviews: candidates.filter((candidate) => candidate.stage === 'INTERVIEW').length,
      offers: candidates.filter((candidate) => candidate.stage === 'OFFER').length,
      hired: candidates.filter((candidate) => candidate.stage === 'HIRED').length,
      byStage: candidates.reduce((acc, candidate) => {
        acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
        return acc;
      }, {})
    });
  } catch (err) {
    next(err);
  }
});

router.get('/jobs', async (req, res, next) => {
  try {
    res.json(await prisma.jobOpening.findMany({ include: jobInclude, orderBy: { createdAt: 'desc' } }));
  } catch (err) {
    next(err);
  }
});

router.post('/jobs', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    res.status(201).json(await prisma.jobOpening.create({ data: jobSchema.parse(req.body), include: jobInclude }));
  } catch (err) {
    next(err);
  }
});

router.put('/jobs/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    res.json(await prisma.jobOpening.update({ where: { id: Number(req.params.id) }, data: jobSchema.partial().parse(req.body), include: jobInclude }));
  } catch (err) {
    next(err);
  }
});

router.delete('/jobs/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.candidate.deleteMany({ where: { jobOpeningId: id } });
    await prisma.jobOpening.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/candidates', async (req, res, next) => {
  try {
    const where = req.query.jobOpeningId ? { jobOpeningId: Number(req.query.jobOpeningId) } : {};
    res.json(await prisma.candidate.findMany({ where, include: candidateInclude, orderBy: { createdAt: 'desc' } }));
  } catch (err) {
    next(err);
  }
});

router.post('/candidates', async (req, res, next) => {
  try {
    res.status(201).json(await prisma.candidate.create({ data: candidateSchema.parse(req.body), include: candidateInclude }));
  } catch (err) {
    next(err);
  }
});

router.put('/candidates/:id', async (req, res, next) => {
  try {
    res.json(await prisma.candidate.update({ where: { id: Number(req.params.id) }, data: candidateSchema.partial().parse(req.body), include: candidateInclude }));
  } catch (err) {
    next(err);
  }
});

router.delete('/candidates/:id', requireRole(['ADMIN']), async (req, res, next) => {
  try {
    await prisma.candidate.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
