import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import departmentRoutes from './routes/department.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import recruitmentRoutes from './routes/recruitment.routes.js';
import reportRoutes from './routes/report.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

export const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/reports', reportRoutes);
app.use(notFound);
app.use(errorHandler);
