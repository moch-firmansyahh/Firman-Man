import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database...');

  // 1. Bersihkan transaksi dan tugas yang ada
  await prisma.transaction.deleteMany();
  await prisma.todo.deleteMany();

  // 2. Buat atau temukan user default
  const email = 'firman@email.com';
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        name: 'Firman',
        email,
        password: hashedPassword,
      },
    });
    console.log(`User baru berhasil dibuat: ${email}`);
  } else {
    console.log(`User sudah ada: ${email}`);
  }

  const userId = user.id;

  // 3. Buat Data Transaksi Dummy (Keuangan)
  const today = new Date();
  
  const transactionsData = [
    {
      type: 'income',
      amount: 1500000,
      category: 'Tabungan',
      note: 'Transfer bulanan dari orang tua',
      date: new Date(new Date().setDate(today.getDate() - 5)),
      userId,
    },
    {
      type: 'income',
      amount: 350000,
      category: 'Lainnya',
      note: 'Fee pembuatan landing page UMKM',
      date: new Date(new Date().setDate(today.getDate() - 3)),
      userId,
    },
    {
      type: 'expense',
      amount: 35000,
      category: 'Makan',
      note: 'Makan siang Nasi Padang + Es Teh',
      date: new Date(new Date().setDate(today.getDate() - 2)),
      userId,
    },
    {
      type: 'expense',
      amount: 20000,
      category: 'Transport',
      note: 'Gojek bolak-balik ke kampus',
      date: new Date(new Date().setDate(today.getDate() - 2)),
      userId,
    },
    {
      type: 'expense',
      amount: 120000,
      category: 'Kebutuhan Kuliah',
      note: 'Beli buku tulis kuarto dan printer tinta',
      date: new Date(new Date().setDate(today.getDate() - 4)),
      userId,
    },
    {
      type: 'expense',
      amount: 75000,
      category: 'Hiburan',
      note: 'Nonton bioskop bareng temen',
      date: new Date(new Date().setDate(today.getDate() - 1)),
      userId,
    },
    {
      type: 'expense',
      amount: 25000,
      category: 'Makan',
      note: 'Beli kopi susu sore',
      date: new Date(),
      userId,
    },
  ];

  for (const tx of transactionsData) {
    await prisma.transaction.create({ data: tx });
  }
  console.log(`Berhasil membuat ${transactionsData.length} transaksi dummy.`);

  // 4. Buat Data Tugas Dummy (Todos)
  const todosData = [
    {
      title: 'Tugas Besar Alpro (Algoritma & Pemrograman)',
      priority: 'high',
      status: 'in_progress',
      category: 'Tugas Besar',
      deadline: new Date(new Date().setDate(today.getDate() + 3)),
      userId,
    },
    {
      title: 'Belajar Fundamental Next.js 15 dan Tailwind v4',
      priority: 'medium',
      status: 'pending',
      category: 'Personal Project',
      deadline: new Date(new Date().setDate(today.getDate() + 7)),
      userId,
    },
    {
      title: 'PR Matematika Diskrit: Relasi dan Fungsi',
      priority: 'high',
      status: 'completed',
      category: 'Kuliah',
      deadline: new Date(new Date().setDate(today.getDate() - 1)),
      userId,
    },
    {
      title: 'Beli Buku Paket Algoritma Pemrograman',
      priority: 'low',
      status: 'completed',
      category: 'Kebutuhan Kuliah',
      deadline: new Date(new Date().setDate(today.getDate() - 2)),
      userId,
    },
    {
      title: 'Ngerapihin kamar kosan & cuci baju',
      priority: 'low',
      status: 'pending',
      category: 'Lainnya',
      deadline: new Date(new Date().setDate(today.getDate() + 1)),
      userId,
    },
  ];

  for (const todo of todosData) {
    await prisma.todo.create({ data: todo });
  }
  console.log(`Berhasil membuat ${todosData.length} tugas dummy.`);

  console.log('Proses seeding database selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('Error saat seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
