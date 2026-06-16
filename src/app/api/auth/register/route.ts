import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль не менее 6 символов' }, { status: 400 });
    }

    // Динамический импорт Prisma (чтобы увидеть ошибку)
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 409 });
    }

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || '' },
    });

    await prisma.$disconnect();

    return NextResponse.json({ message: 'Регистрация успешна', userId: user.id }, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error.message);
    return NextResponse.json({ error: 'Ошибка сервера: ' + error.message }, { status: 500 });
  }
}