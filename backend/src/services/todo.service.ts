import prisma from '../config/prisma';
import { CreateTodoInput } from '../validators/todo.validator';

export const getTodos = async (userId: string, filters: { status?: string; priority?: string; category?: string }) => {
  const whereClause: any = { userId };

  if (filters.status) {
    whereClause.status = filters.status;
  }
  if (filters.priority) {
    whereClause.priority = filters.priority;
  }
  if (filters.category) {
    whereClause.category = filters.category;
  }

  return prisma.todo.findMany({
    where: whereClause,
    orderBy: [
      { status: 'asc' }, // active tasks first
      { deadline: 'asc' },
      { createdAt: 'desc' },
    ],
  });
};

export const createTodo = async (userId: string, data: CreateTodoInput) => {
  return prisma.todo.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const updateTodo = async (id: string, userId: string, data: CreateTodoInput) => {
  const todo = await prisma.todo.findFirst({
    where: { id, userId },
  });

  if (!todo) {
    throw new Error('Todo tidak ditemukan.');
  }

  return prisma.todo.update({
    where: { id },
    data,
  });
};

export const updateTodoStatus = async (id: string, userId: string, status: string) => {
  const todo = await prisma.todo.findFirst({
    where: { id, userId },
  });

  if (!todo) {
    throw new Error('Todo tidak ditemukan.');
  }

  return prisma.todo.update({
    where: { id },
    data: { status },
  });
};

export const deleteTodo = async (id: string, userId: string) => {
  const todo = await prisma.todo.findFirst({
    where: { id, userId },
  });

  if (!todo) {
    throw new Error('Todo tidak ditemukan.');
  }

  return prisma.todo.delete({
    where: { id },
  });
};

export const getTodosSummary = async (userId: string) => {
  const total = await prisma.todo.count({ where: { userId } });
  const pending = await prisma.todo.count({ where: { userId, status: 'pending' } });
  const inProgress = await prisma.todo.count({ where: { userId, status: 'in_progress' } });
  const completed = await prisma.todo.count({ where: { userId, status: 'completed' } });

  // Get up to 5 uncompleted tasks closest to their deadlines
  const approachingDeadline = await prisma.todo.findMany({
    where: {
      userId,
      status: { not: 'completed' },
      deadline: { not: null },
    },
    orderBy: {
      deadline: 'asc',
    },
    take: 5,
  });

  return {
    total,
    pending,
    inProgress,
    completed,
    approachingDeadline,
  };
};
