import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mera-secret-key-2026';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Проверка на пустые поля
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Создаём JWT-токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Создаём ответ и ставим токен в куки
    const response = NextResponse.json(
      { message: 'Вход выполнен', userId: user.id, name: user.name },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false, // в разработке false, в продакшене true
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    });

    return response;
  } catch (error) {
    console.error('Ошибка входа:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}