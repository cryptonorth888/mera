import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Удаляем все старые продукты (если есть)
  await prisma.mealEntry.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.foodItem.deleteMany();

  console.log('Старые данные очищены. Добавляем продукты...');

  const products = [
    { name: 'Гречка ядрица (варёная)', brand: 'Увелка', barcode: '4607001690012', calories: 110, protein: 4.2, fat: 1.1, carbs: 20.6, fiber: 2.7, isPublic: true, isVerified: true },
    { name: 'Куриная грудка (запечённая)', brand: 'Петелинка', barcode: '4607028390010', calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Творог 5%', brand: 'Простоквашино', barcode: '4607004890013', calories: 145, protein: 21, fat: 5, carbs: 3, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Творог 9%', brand: 'Простоквашино', barcode: '4607004890014', calories: 169, protein: 18, fat: 9, carbs: 3, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Кефир 2.5%', brand: 'Домик в деревне', barcode: '4607000150015', calories: 53, protein: 2.9, fat: 2.5, carbs: 4, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сметана 20%', brand: 'Простоквашино', barcode: '4607004890015', calories: 206, protein: 2.5, fat: 20, carbs: 3.4, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Борщ классический', brand: 'Шеф-повар', barcode: '4607123450016', calories: 57, protein: 3.8, fat: 2.9, carbs: 4.3, fiber: 1.2, isPublic: true, isVerified: true },
    { name: 'Оливье (с колбасой)', brand: 'Шеф-повар', barcode: '4607123450017', calories: 195, protein: 5.5, fat: 15.5, carbs: 7.8, fiber: 0.8, isPublic: true, isVerified: true },
    { name: 'Пельмени свино-говяжьи', brand: 'Сибирская коллекция', barcode: '4607056780018', calories: 275, protein: 12, fat: 12, carbs: 29, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Сырники (из творога 9%)', brand: 'ВкусВилл', barcode: '4607123990019', calories: 220, protein: 18, fat: 10, carbs: 14, fiber: 0.5, isPublic: true, isVerified: true },
    { name: 'Хлеб Бородинский', brand: 'Коломенское', barcode: '4607001000020', calories: 200, protein: 6.8, fat: 1.3, carbs: 39.8, fiber: 6.5, isPublic: true, isVerified: true },
    { name: 'Масло сливочное 82.5%', brand: 'Вологодское', barcode: '4607000150021', calories: 748, protein: 0.5, fat: 82.5, carbs: 0.8, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Яйцо куриное варёное (1 шт)', brand: 'Роскар', barcode: '4607123450022', calories: 158, protein: 12.7, fat: 11.5, carbs: 0.7, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Банан свежий', brand: '', barcode: '4607000000023', calories: 96, protein: 1.5, fat: 0.5, carbs: 21, fiber: 1.7, isPublic: true, isVerified: true },
    { name: 'Яблоко красное', brand: '', barcode: '4607000000024', calories: 52, protein: 0.3, fat: 0.2, carbs: 14, fiber: 2.4, isPublic: true, isVerified: true },
    { name: 'Овсянка (хлопья сухие)', brand: 'Ясно солнышко', barcode: '4607123450025', calories: 366, protein: 12, fat: 6, carbs: 62, fiber: 7, isPublic: true, isVerified: true },
    { name: 'Макароны варёные (твёрдые сорта)', brand: 'Barilla', barcode: '4607123450026', calories: 112, protein: 4.5, fat: 0.6, carbs: 23, fiber: 1.8, isPublic: true, isVerified: true },
    { name: 'Картофель варёный', brand: '', barcode: '4607000000027', calories: 82, protein: 2, fat: 0.4, carbs: 16.7, fiber: 1.8, isPublic: true, isVerified: true },
    { name: 'Лосось слабосолёный', brand: 'Русское море', barcode: '4607056780028', calories: 202, protein: 22, fat: 12, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сахар-песок', brand: 'Русский сахар', barcode: '4607001000029', calories: 399, protein: 0, fat: 0, carbs: 99.8, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Молоко 3.2%', brand: 'Домик в деревне', barcode: '4607000150030', calories: 60, protein: 2.9, fat: 3.2, carbs: 4.7, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Подсолнечное масло', brand: 'Олейна', barcode: '4607123450031', calories: 899, protein: 0, fat: 99.9, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Шоколад Алёнка', brand: 'Красный Октябрь', barcode: '4607001000032', calories: 538, protein: 5.7, fat: 31.5, carbs: 57, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Зефир классический', brand: 'Шармэль', barcode: '4607123450033', calories: 320, protein: 0.8, fat: 0.1, carbs: 79, fiber: 0.5, isPublic: true, isVerified: true },
    { name: 'Огурец свежий', brand: '', barcode: '4607000000034', calories: 15, protein: 0.8, fat: 0.1, carbs: 2.5, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Помидор свежий', brand: '', barcode: '4607000000035', calories: 20, protein: 1.1, fat: 0.2, carbs: 3.7, fiber: 1.2, isPublic: true, isVerified: true },
    { name: 'Рис белый варёный', brand: 'Мистраль', barcode: '4607123450036', calories: 116, protein: 2.2, fat: 0.5, carbs: 25, fiber: 0.3, isPublic: true, isVerified: true },
    { name: 'Колбаса Докторская', brand: 'Велком', barcode: '4607056780037', calories: 257, protein: 13, fat: 22, carbs: 1.5, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сыр Российский 50%', brand: 'Киприно', barcode: '4607123450038', calories: 364, protein: 23, fat: 29, carbs: 2, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Капуста белокочанная', brand: '', barcode: '4607000000039', calories: 25, protein: 1.3, fat: 0.1, carbs: 4.7, fiber: 2.3, isPublic: true, isVerified: true },
    { name: 'Свёкла варёная', brand: '', barcode: '4607000000040', calories: 44, protein: 1.7, fat: 0.2, carbs: 8.8, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Морковь свежая', brand: '', barcode: '4607000000041', calories: 35, protein: 1.3, fat: 0.1, carbs: 6.9, fiber: 2.4, isPublic: true, isVerified: true },
    { name: 'Чеснок', brand: '', barcode: '4607000000042', calories: 149, protein: 6.4, fat: 0.5, carbs: 30, fiber: 2.1, isPublic: true, isVerified: true },
    { name: 'Лук репчатый', brand: '', barcode: '4607000000043', calories: 40, protein: 1.1, fat: 0.1, carbs: 8.2, fiber: 1.7, isPublic: true, isVerified: true },
    { name: 'Укроп свежий', brand: '', barcode: '4607000000044', calories: 43, protein: 3.5, fat: 1.1, carbs: 4.9, fiber: 2.1, isPublic: true, isVerified: true },
    { name: 'Скумбрия копчёная', brand: 'Русское море', barcode: '4607056780045', calories: 221, protein: 20, fat: 15, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Фасоль красная консервированная', brand: 'Бондюэль', barcode: '4607123450046', calories: 90, protein: 6, fat: 0.5, carbs: 15, fiber: 5, isPublic: true, isVerified: true },
    { name: 'Горошек зелёный консервированный', brand: 'Бондюэль', barcode: '4607123450047', calories: 55, protein: 4, fat: 0.3, carbs: 9, fiber: 3, isPublic: true, isVerified: true },
    { name: 'Мёд натуральный', brand: 'Медовый край', barcode: '4607123450048', calories: 304, protein: 0.3, fat: 0, carbs: 82, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Вода питьевая (250 мл)', brand: 'Святой источник', barcode: '4607001000049', calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
  ];

  for (const product of products) {
    await prisma.foodItem.create({ data: product });
  }

  console.log(`✅ Добавлено ${products.length} продуктов!`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });