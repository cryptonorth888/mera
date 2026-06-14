import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mera-super-secret-key-2026';

export async function GET(request: NextRequest) {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [user, meals, waterLogs] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.meal.findMany({
        where: { userId, date: { gte: today, lt: tomorrow } },
        include: { entries: { include: { foodItem: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.waterLog.findMany({
        where: { userId, date: { gte: today, lt: tomorrow } },
      }),
    ]);

    const totalWater = waterLogs.reduce((sum, w) => sum + w.amountMl, 0);

    let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
    for (const meal of meals) {
      for (const e of meal.entries) {
        totalCalories += (e.caloriesSnapshot * e.servings) / 100;
        totalProtein += (e.proteinSnapshot * e.servings) / 100;
        totalFat += (e.fatSnapshot * e.servings) / 100;
        totalCarbs += (e.carbsSnapshot * e.servings) / 100;
      }
    }

    return NextResponse.json({
      date: today.toISOString().split('T')[0],
      userName: user?.name,
      goals: {
        calories: user?.dailyCalorieGoal || 2000,
        protein: user?.dailyProteinGoal || 100,
        fat: user?.dailyFatGoal || 65,
        carbs: user?.dailyCarbsGoal || 250,
      },
      consumed: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        fat: Math.round(totalFat),
        carbs: Math.round(totalCarbs),
      },
      water: { consumed: totalWater, goal: 2000 },
      meals: meals.map((meal) => ({
        id: meal.id,
        mealType: meal.mealType,
        entries: meal.entries.map((e) => ({
          id: e.id,
          foodName: e.foodItem.name,
          servings: e.servings,
          calories: Math.round((e.caloriesSnapshot * e.servings) / 100),
          protein: Math.round((e.proteinSnapshot * e.servings) / 100),
          fat: Math.round((e.fatSnapshot * e.servings) / 100),
          carbs: Math.round((e.carbsSnapshot * e.servings) / 100),
        })),
      })),
    });
  } catch (error: any) {
    console.error('Daily summary error:', error.message);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}