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
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dailyCalorieGoal: true,
      dailyProteinGoal: true,
      dailyFatGoal: true,
      dailyCarbsGoal: true,
      weight: true,
      targetWeight: true,
      height: true,
      age: true,
      gender: true,
      activityLevel: true,
    },
  });

  return NextResponse.json({
    calories: user?.dailyCalorieGoal || 2000,
    protein: user?.dailyProteinGoal || 100,
    fat: user?.dailyFatGoal || 65,
    carbs: user?.dailyCarbsGoal || 250,
    weight: user?.weight || null,
    targetWeight: user?.targetWeight || null,
    height: user?.height || null,
    age: user?.age || null,
    gender: user?.gender || null,
    activityLevel: user?.activityLevel || null,
  });
}

export async function PUT(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const body = await request.json();
  const { calories, protein, fat, carbs, weight, targetWeight, height, age, gender, activityLevel } = body;

  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyCalorieGoal: calories,
      dailyProteinGoal: protein,
      dailyFatGoal: fat,
      dailyCarbsGoal: carbs,
      weight: weight || undefined,
      targetWeight: targetWeight || undefined,
      height: height || undefined,
      age: age || undefined,
      gender: gender || undefined,
      activityLevel: activityLevel || undefined,
    },
  });

  return NextResponse.json({ success: true });
}