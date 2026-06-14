import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q') || '';
    
    const products = await prisma.foodItem.findMany({
      where: {
        isPublic: true,
        name: { contains: q },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Search error:', error.message);
    return NextResponse.json({ products: [] });
  }
}