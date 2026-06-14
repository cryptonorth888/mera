import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    console.log('Получены данные:', { email, name });

    // Проверка на пустые поля
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Проверка длины пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 6 символов' },
        { status: 400 }
      );
    }

    // Проверка, есть ли уже такой пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    console.log('Существующий пользователь:', existingUser);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хэшируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('Создаём пользователя...');

    // Создаём пользователя
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || '',
      },
    });

    console.log('Пользователь создан:', user.id);

    return NextResponse.json(
      { message: 'Регистрация успешна', userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Ошибка регистрации:', error.message);
    console.error('Полная ошибка:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера: ' + error.message },
      { status: 500 }
    );
  }
}