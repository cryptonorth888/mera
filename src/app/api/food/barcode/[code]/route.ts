import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.pathname.split('/').pop() || '';

  const product = await prisma.foodItem.findFirst({
    where: { barcode: code, isPublic: true },
  });

  if (!product) {
    return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
  }

  return NextResponse.json({ product });
}