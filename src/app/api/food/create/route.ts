import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mera-super-secret-key-2026';

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
    const { name, brand, calories, protein, fat, carbs, fiber } = body;

    if (!name || !calories || !protein || !fat || !carbs) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 });
    }

    // Проверяем, есть ли похожие продукты
    const similar = await prisma.foodItem.findMany({
      where: {
        name: { contains: name },
        isPublic: true,
      },
      select: { name: true, calories: true, protein: true, fat: true, carbs: true },
    });

    let isPublic = false;
    let isVerified = false;

    // Если 3+ похожих продукта — делаем публичным
    const verySimilar = similar.filter(p =>
      Math.abs(p.calories - calories) < 10 &&
      Math.abs(p.protein - protein) < 2 &&
      Math.abs(p.fat - fat) < 2 &&
      Math.abs(p.carbs - carbs) < 5
    );

    if (verySimilar.length >= 3) {
      isPublic = true;
    }

    const product = await prisma.foodItem.create({
      data: {
        name,
        brand: brand || '',
        calories,
        protein,
        fat,
        carbs,
        fiber: fiber || 0,
        isPublic,
        isVerified,
        createdById: userId,
      },
    });

    return NextResponse.json({
      success: true,
      product,
      similarCount: verySimilar.length,
      becamePublic: isPublic,
    });
  } catch (error: any) {
    console.error('Create food error:', error.message);
    return NextResponse.json({ error: 'Ошибка создания продукта' }, { status: 500 });
  }
}