import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mera-super-secret-key-2026';

const fallbackReplies = [
  'Отличный выбор! Не забудь добавить овощи для баланса 🥗',
  'Рекомендую увеличить потребление белка — это поможет дольше оставаться сытым 💪',
  'Обрати внимание на водный баланс. Норма — 30 мл на кг веса 💧',
  'Хороший вопрос! Я бы посоветовал разбить приёмы пищи на 4-5 раз в день',
  'Сегодня ты на правильном пути! Продолжай в том же духе 🎯',
  'Совет: планируй меню заранее — это помогает избежать спонтанных перекусов 📋',
  'Не забывай про клетчатку! Овощи и цельнозерновые продукты — твои друзья 🥦',
  'Отличная динамика! Твой прогресс заметен, продолжай! 📉',
];

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    try {
      jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { prompt } = await request.json();
    if (!prompt) return NextResponse.json({ error: 'Пустой запрос' }, { status: 400 });

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (apiKey && apiKey !== 'sk-your-key') {
      const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `Ты — Оскар, персональный ИИ-диетолог в приложении «Мера». 
              Ты профессионал: даёшь точные, полезные советы по питанию, калориям, БЖУ, продуктам.
              Твой стиль: деловой, но дружелюбный. Иногда добавляешь лёгкий кошачий юмор (одно «мяу» в 3-4 сообщениях).
              Отвечай кратко (2-4 предложения). Используй эмодзи по делу.
              Не используй «мур-мур», «лапки», «шёрстка» — это слишком по-кошачьи.
              Ты в первую очередь диетолог, а кот — во вторую.`
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 300,
        }),
      });

      const data = await deepseekResponse.json();
      const reply = data.choices?.[0]?.message?.content || 'Отличный вопрос! Дай мне секунду... 🐱';

      return NextResponse.json({ reply });
    }

    const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Oscar error:', error.message);
    return NextResponse.json({ reply: 'Извини, я сейчас занят. Попробуй через минуту 🙀' });
  }
}