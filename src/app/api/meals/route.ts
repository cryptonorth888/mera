import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mera-secret-key-2026';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { mealType, foodItemId, servings } = body;

    const foodItem = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
    if (!foodItem) return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let meal = await prisma.meal.findFirst({
      where: { userId, mealType, date: { gte: today } },
    });

    if (!meal) {
      meal = await prisma.meal.create({
        data: { userId, mealType, date: today },
      });
    }

    const entry = await prisma.mealEntry.create({
      data: {
        mealId: meal.id,
        foodItemId,
        servings,
        caloriesSnapshot: foodItem.calories,
        proteinSnapshot: foodItem.protein,
        fatSnapshot: foodItem.fat,
        carbsSnapshot: foodItem.carbs,
      },
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error: any) {
    console.error('Meal error:', error.message);
    return NextResponse.json({ error: 'Ошибка. Попробуйте ещё раз.' }, { status: 500 });
  }
}