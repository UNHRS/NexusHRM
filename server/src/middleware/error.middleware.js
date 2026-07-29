import { ZodError } from 'zod';

export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.errors[0]?.message || 'Invalid request' });
  }
  if (err?.code === 'P2002') return res.status(400).json({ error: 'A record with that value already exists' });
  if (err?.code === 'P2003') return res.status(400).json({ error: 'Related record not found' });
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}
