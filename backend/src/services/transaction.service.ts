import prisma from '../config/prisma';
import { CreateTransactionInput } from '../validators/transaction.validator';

export const getTransactions = async (userId: string, filters: { startDate?: string; endDate?: string; category?: string }) => {
  const whereClause: any = { userId };

  if (filters.category) {
    whereClause.category = filters.category;
  }

  if (filters.startDate || filters.endDate) {
    whereClause.date = {};
    if (filters.startDate) {
      whereClause.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.date.lte = new Date(filters.endDate);
    }
  }

  return prisma.transaction.findMany({
    where: whereClause,
    orderBy: {
      date: 'desc',
    },
  });
};

export const createTransaction = async (userId: string, data: CreateTransactionInput) => {
  return prisma.transaction.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const updateTransaction = async (id: string, userId: string, data: CreateTransactionInput) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!transaction) {
    throw new Error('Transaksi tidak ditemukan.');
  }

  return prisma.transaction.update({
    where: { id },
    data,
  });
};

export const deleteTransaction = async (id: string, userId: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!transaction) {
    throw new Error('Transaksi tidak ditemukan.');
  }

  return prisma.transaction.delete({
    where: { id },
  });
};

export const getFinanceSummary = async (userId: string) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
    }
  });

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionsCount: transactions.length,
  };
};
