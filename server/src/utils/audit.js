import { prisma } from './prisma.js';

export function logAction({ actorId, action, targetType, targetId, metadata }) {
  return prisma.auditLog.create({ data: { actorId, action, targetType, targetId, metadata } });
}
