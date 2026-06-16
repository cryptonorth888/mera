import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Таблица транслитерации (латиница → кириллица, русская раскладка)
const translitMap: Record<string, string> = {
  'a': 'ф', 'b': 'и', 'c': 'с', 'd': 'в', 'e': 'у', 'f': 'а',
  'g': 'п', 'h': 'р', 'i': 'ш', 'j': 'о', 'k': 'л', 'l': 'д',
  'm': 'ь', 'n': 'т', 'o': 'щ', 'p': 'з', 'q': 'й', 'r': 'к',
  's': 'ы', 't': 'е', 'u': 'г', 'v': 'м', 'w': 'ц', 'x': 'ч',
  'y': 'н', 'z': 'я',
  'A': 'Ф', 'B': 'И', 'C': 'С', 'D': 'В', 'E': 'У', 'F': 'А',
  'G': 'П', 'H': 'Р', 'I': 'Ш', 'J': 'О', 'K': 'Л', 'L': 'Д',
  'M': 'Ь', 'N': 'Т', 'O': 'Щ', 'P': 'З', 'Q': 'Й', 'R': 'К',
  'S': 'Ы', 'T': 'Е', 'U': 'Г', 'V': 'М', 'W': 'Ц', 'X': 'Ч',
  'Y': 'Н', 'Z': 'Я',
  ',': 'б', '<': 'Б', '.': 'ю', '>': 'Ю', '`': 'ё', '~': 'Ё',
  '[': 'х', '{': 'Х', ']': 'ъ', '}': 'Ъ', ';': 'ж', ':': 'Ж',
  '\'': 'э', '"': 'Э',
};

function fixLayout(input: string): string {
  if (/[а-яА-ЯёЁ]/.test(input)) return input;
  return input.split('').map(ch => translitMap[ch] || ch).join('');
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q') || '';
    const query = fixLayout(q);

    let products = await prisma.foodItem.findMany({
      where: {
        isPublic: true,
        name: { startsWith: query },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    // Если ничего не нашлось — попробуем с большой буквы
    if (products.length === 0 && query.length > 0) {
      const qCapitalized = query.charAt(0).toUpperCase() + query.slice(1);
      products = await prisma.foodItem.findMany({
        where: {
          isPublic: true,
          name: { startsWith: qCapitalized },
        },
        take: 20,
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Search error:', error.message);
    return NextResponse.json({ products: [] });
  }
}