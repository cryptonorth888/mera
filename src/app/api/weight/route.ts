import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mera-super-secret-key-2026';

function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch { return null; }
}

// Получить историю веса
export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const logs = await prisma.weightLog.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
    take: 90,
  });

  return NextResponse.json({ logs });
}

// Добавить вес
export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { weight } = await request.json();
  if (!weight) return NextResponse.json({ error: 'Вес обязателен' }, { status: 400 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let log = await prisma.weightLog.findFirst({
    where: { userId, date: { gte: today } },
  });

  if (log) {
    log = await prisma.weightLog.update({
      where: { id: log.id },
      data: { weight },
    });
  } else {
    log = await prisma.weightLog.create({
      data: { userId, weight, date: today },
    });
  }

  return NextResponse.json({ success: true, log });
}