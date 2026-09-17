import { prisma } from './prisma.js';

export async function logAction({ actorId, action, targetType, targetId, metadata }) {
  const data = { actorId, action, targetType, targetId, metadata };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.auditLog.create({ data });
    } catch (error) {
      if (attempt === 2) {
        console.error('Audit log write failed', { action, targetType, targetId, actorId, error });
      }
    }
  }
  return null;
}
