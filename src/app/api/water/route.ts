import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mera-secret-key-2026';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { amountMl } = await request.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let log = await prisma.waterLog.findFirst({
      where: { userId: decoded.userId, date: { gte: today } },
    });

    if (log) {
      log = await prisma.waterLog.update({
        where: { id: log.id },
        data: { amountMl: log.amountMl + amountMl },
      });
    } else {
      log = await prisma.waterLog.create({
        data: { userId: decoded.userId, amountMl, date: today },
      });
    }

    return NextResponse.json({ success: true, amountMl: log.amountMl });
  } catch (error: any) {
    console.error('Water error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}