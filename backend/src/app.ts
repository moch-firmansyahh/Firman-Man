import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import todoRoutes from './routes/todo.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// Set CORS policies to accept httpOnly cookie credentials from frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FirmanMan API server is active.' });
});

// Mount modular routing tables
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/todos', todoRoutes);

// Catch-all global error handling middleware
app.use(errorHandler);

export default app;
