import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Очищаем старые продукты...');
  await prisma.mealEntry.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.foodItem.deleteMany();

  console.log('Добавляем 100+ продуктов...');

  const products = [
    // Крупы и каши
    { name: 'Гречка ядрица (варёная)', brand: 'Увелка', calories: 110, protein: 4.2, fat: 1.1, carbs: 20.6, fiber: 2.7, isPublic: true, isVerified: true },
    { name: 'Рис белый варёный', brand: 'Мистраль', calories: 116, protein: 2.2, fat: 0.5, carbs: 25, fiber: 0.3, isPublic: true, isVerified: true },
    { name: 'Рис бурый варёный', brand: 'Мистраль', calories: 112, protein: 2.6, fat: 0.9, carbs: 23, fiber: 1.8, isPublic: true, isVerified: true },
    { name: 'Овсянка на воде', brand: 'Ясно солнышко', calories: 88, protein: 3, fat: 1.7, carbs: 15, fiber: 1.5, isPublic: true, isVerified: true },
    { name: 'Овсянка на молоке', brand: 'Ясно солнышко', calories: 102, protein: 3.2, fat: 4.1, carbs: 14.5, fiber: 1.2, isPublic: true, isVerified: true },
    { name: 'Манная каша на молоке', brand: '', calories: 98, protein: 3, fat: 3.2, carbs: 15.3, fiber: 0.2, isPublic: true, isVerified: true },
    { name: 'Пшённая каша на воде', brand: '', calories: 90, protein: 3, fat: 0.7, carbs: 17, fiber: 0.8, isPublic: true, isVerified: true },
    { name: 'Перловка варёная', brand: '', calories: 109, protein: 3.1, fat: 0.4, carbs: 23, fiber: 3.8, isPublic: true, isVerified: true },
    { name: 'Булгур варёный', brand: 'Мистраль', calories: 83, protein: 3.1, fat: 0.2, carbs: 18.6, fiber: 4.5, isPublic: true, isVerified: true },
    { name: 'Киноа варёное', brand: 'Мистраль', calories: 120, protein: 4.4, fat: 1.9, carbs: 21, fiber: 2.8, isPublic: true, isVerified: true },
    { name: 'Кускус варёный', brand: 'Yelli', calories: 112, protein: 3.8, fat: 0.2, carbs: 23, fiber: 1.4, isPublic: true, isVerified: true },
    { name: 'Макароны варёные (твёрдые сорта)', brand: 'Barilla', calories: 112, protein: 4.5, fat: 0.6, carbs: 23, fiber: 1.8, isPublic: true, isVerified: true },
    { name: 'Спагетти варёные', brand: 'Barilla', calories: 158, protein: 5.8, fat: 0.9, carbs: 31, fiber: 1.8, isPublic: true, isVerified: true },
    { name: 'Гречневая лапша (соба)', brand: '', calories: 99, protein: 5.1, fat: 0.7, carbs: 21.4, fiber: 0.5, isPublic: true, isVerified: true },
    { name: 'Фунчоза варёная', brand: '', calories: 80, protein: 0.2, fat: 0.1, carbs: 20, fiber: 0.5, isPublic: true, isVerified: true },

    // Мясо и птица
    { name: 'Куриная грудка (запечённая)', brand: 'Петелинка', calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Куриное бедро (запечённое без кожи)', brand: 'Петелинка', calories: 177, protein: 24, fat: 8.5, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Куриное филе варёное', brand: 'Петелинка', calories: 153, protein: 30, fat: 3.5, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Куриные крылья запечённые', brand: '', calories: 203, protein: 22, fat: 12, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Индейка филе запечённая', brand: 'Индилайт', calories: 135, protein: 28, fat: 2.5, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Говядина варёная', brand: '', calories: 254, protein: 26, fat: 17, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Говядина тушёная', brand: '', calories: 232, protein: 18, fat: 16, carbs: 3, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Свинина нежирная варёная', brand: '', calories: 245, protein: 25, fat: 15, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Свиная отбивная жареная', brand: '', calories: 310, protein: 24, fat: 22, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Баранина тушёная', brand: '', calories: 243, protein: 20, fat: 18, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Котлеты куриные жареные', brand: '', calories: 230, protein: 18, fat: 15, carbs: 8, fiber: 0.3, isPublic: true, isVerified: true },
    { name: 'Котлеты говяжьи жареные', brand: '', calories: 260, protein: 17, fat: 19, carbs: 9, fiber: 0.3, isPublic: true, isVerified: true },
    { name: 'Шашлык свиной', brand: '', calories: 280, protein: 22, fat: 20, carbs: 1, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Шашлык куриный', brand: '', calories: 190, protein: 24, fat: 9, carbs: 1, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Бекон жареный', brand: '', calories: 541, protein: 12, fat: 42, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Колбаса Докторская', brand: 'Велком', calories: 257, protein: 13, fat: 22, carbs: 1.5, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Колбаса Сервелат', brand: 'Велком', calories: 430, protein: 12, fat: 40, carbs: 2, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сосиски молочные', brand: 'Велком', calories: 266, protein: 11, fat: 24, carbs: 2, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Ветчина', brand: 'Черкизово', calories: 270, protein: 14, fat: 23, carbs: 1, fiber: 0, isPublic: true, isVerified: true },

    // Рыба и морепродукты
    { name: 'Лосось слабосолёный', brand: 'Русское море', calories: 202, protein: 22, fat: 12, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Лосось запечённый', brand: '', calories: 208, protein: 23, fat: 13, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Форель запечённая', brand: '', calories: 148, protein: 20, fat: 7, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Скумбрия копчёная', brand: 'Русское море', calories: 221, protein: 20, fat: 15, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сельдь слабосолёная', brand: 'Русское море', calories: 217, protein: 18, fat: 16, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Тунец консервированный в воде', brand: 'John West', calories: 116, protein: 26, fat: 0.8, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Тунец консервированный в масле', brand: 'John West', calories: 198, protein: 24, fat: 10, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Горбуша консервированная', brand: 'Доброфлот', calories: 136, protein: 21, fat: 5.5, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Шпроты в масле', brand: 'Рижские', calories: 363, protein: 17, fat: 32, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Минтай варёный', brand: '', calories: 79, protein: 17, fat: 1, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Треска варёная', brand: '', calories: 78, protein: 17, fat: 0.7, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Креветки варёные', brand: '', calories: 99, protein: 20, fat: 1.2, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Кальмар варёный', brand: '', calories: 92, protein: 18, fat: 2.2, carbs: 0, fiber: 0, isPublic: true, isVerified: true },

    // Молочные продукты
    { name: 'Молоко 3.2%', brand: 'Домик в деревне', calories: 60, protein: 2.9, fat: 3.2, carbs: 4.7, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Молоко 1.5%', brand: 'Домик в деревне', calories: 45, protein: 2.8, fat: 1.5, carbs: 4.8, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Кефир 2.5%', brand: 'Домик в деревне', calories: 53, protein: 2.9, fat: 2.5, carbs: 4, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Кефир 1%', brand: 'Домик в деревне', calories: 40, protein: 3, fat: 1, carbs: 4, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Творог 5%', brand: 'Простоквашино', calories: 145, protein: 21, fat: 5, carbs: 3, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Творог 9%', brand: 'Простоквашино', calories: 169, protein: 18, fat: 9, carbs: 3, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Творог обезжиренный', brand: 'Простоквашино', calories: 103, protein: 22, fat: 0.6, carbs: 3.3, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сметана 20%', brand: 'Простоквашино', calories: 206, protein: 2.5, fat: 20, carbs: 3.4, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сметана 15%', brand: 'Простоквашино', calories: 162, protein: 2.6, fat: 15, carbs: 3.6, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Йогурт натуральный 2%', brand: 'Активиа', calories: 60, protein: 4.5, fat: 2, carbs: 6, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сыр Российский 50%', brand: 'Киприно', calories: 364, protein: 23, fat: 29, carbs: 2, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сыр Гауда', brand: '', calories: 356, protein: 25, fat: 27, carbs: 2, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сыр Моцарелла', brand: 'Galbani', calories: 280, protein: 18, fat: 22, carbs: 2.2, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сыр Брынза', brand: '', calories: 260, protein: 17, fat: 21, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сыр творожный сливочный', brand: 'Hochland', calories: 231, protein: 6, fat: 23, carbs: 3, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Масло сливочное 82.5%', brand: 'Вологодское', calories: 748, protein: 0.5, fat: 82.5, carbs: 0.8, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Масло сливочное 72.5%', brand: 'Вологодское', calories: 661, protein: 0.8, fat: 72.5, carbs: 1.3, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Ряженка 2.5%', brand: 'Домик в деревне', calories: 54, protein: 2.9, fat: 2.5, carbs: 4.2, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Снежок 2.5%', brand: 'Домик в деревне', calories: 72, protein: 2.7, fat: 2.5, carbs: 10.5, fiber: 0, isPublic: true, isVerified: true },

    // Овощи
    { name: 'Огурец свежий', brand: '', calories: 15, protein: 0.8, fat: 0.1, carbs: 2.5, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Помидор свежий', brand: '', calories: 20, protein: 1.1, fat: 0.2, carbs: 3.7, fiber: 1.2, isPublic: true, isVerified: true },
    { name: 'Болгарский перец', brand: '', calories: 27, protein: 1.3, fat: 0.2, carbs: 5.3, fiber: 1.7, isPublic: true, isVerified: true },
    { name: 'Морковь свежая', brand: '', calories: 35, protein: 1.3, fat: 0.1, carbs: 6.9, fiber: 2.4, isPublic: true, isVerified: true },
    { name: 'Капуста белокочанная', brand: '', calories: 25, protein: 1.3, fat: 0.1, carbs: 4.7, fiber: 2.3, isPublic: true, isVerified: true },
    { name: 'Капуста цветная варёная', brand: '', calories: 23, protein: 1.8, fat: 0.3, carbs: 4, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Брокколи варёная', brand: '', calories: 35, protein: 2.4, fat: 0.4, carbs: 7, fiber: 3.3, isPublic: true, isVerified: true },
    { name: 'Свёкла варёная', brand: '', calories: 44, protein: 1.7, fat: 0.2, carbs: 8.8, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Картофель варёный', brand: '', calories: 82, protein: 2, fat: 0.4, carbs: 16.7, fiber: 1.8, isPublic: true, isVerified: true },
    { name: 'Картофель жареный', brand: '', calories: 192, protein: 2.8, fat: 9.5, carbs: 23, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Картофельное пюре на молоке', brand: '', calories: 106, protein: 2.5, fat: 4.2, carbs: 14, fiber: 1.3, isPublic: true, isVerified: true },
    { name: 'Кабачок тушёный', brand: '', calories: 24, protein: 0.6, fat: 0.3, carbs: 4.6, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Баклажан запечённый', brand: '', calories: 35, protein: 1, fat: 0.2, carbs: 6.5, fiber: 3, isPublic: true, isVerified: true },
    { name: 'Тыква запечённая', brand: '', calories: 26, protein: 1, fat: 0.1, carbs: 4.4, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Лук репчатый', brand: '', calories: 40, protein: 1.1, fat: 0.1, carbs: 8.2, fiber: 1.7, isPublic: true, isVerified: true },
    { name: 'Чеснок', brand: '', calories: 149, protein: 6.4, fat: 0.5, carbs: 30, fiber: 2.1, isPublic: true, isVerified: true },
    { name: 'Укроп свежий', brand: '', calories: 43, protein: 3.5, fat: 1.1, carbs: 4.9, fiber: 2.1, isPublic: true, isVerified: true },
    { name: 'Петрушка свежая', brand: '', calories: 47, protein: 3.7, fat: 0.4, carbs: 7.6, fiber: 2.1, isPublic: true, isVerified: true },
    { name: 'Салат листовой', brand: '', calories: 15, protein: 1.2, fat: 0.3, carbs: 2, fiber: 1.3, isPublic: true, isVerified: true },
    { name: 'Редис', brand: '', calories: 16, protein: 0.7, fat: 0.1, carbs: 3.4, fiber: 1.6, isPublic: true, isVerified: true },

    // Фрукты и ягоды
    { name: 'Яблоко красное', brand: '', calories: 52, protein: 0.3, fat: 0.2, carbs: 14, fiber: 2.4, isPublic: true, isVerified: true },
    { name: 'Яблоко зелёное', brand: '', calories: 47, protein: 0.4, fat: 0.4, carbs: 9.8, fiber: 1.8, isPublic: true, isVerified: true },
    { name: 'Банан свежий', brand: '', calories: 96, protein: 1.5, fat: 0.5, carbs: 21, fiber: 1.7, isPublic: true, isVerified: true },
    { name: 'Апельсин', brand: '', calories: 47, protein: 0.9, fat: 0.1, carbs: 12, fiber: 2.4, isPublic: true, isVerified: true },
    { name: 'Мандарин', brand: '', calories: 53, protein: 0.8, fat: 0.3, carbs: 13, fiber: 1.8, isPublic: true, isVerified: true },
    { name: 'Груша', brand: '', calories: 57, protein: 0.4, fat: 0.1, carbs: 15, fiber: 3.1, isPublic: true, isVerified: true },
    { name: 'Виноград', brand: '', calories: 69, protein: 0.7, fat: 0.2, carbs: 17, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Киви', brand: '', calories: 61, protein: 1.1, fat: 0.5, carbs: 15, fiber: 3, isPublic: true, isVerified: true },
    { name: 'Хурма', brand: '', calories: 67, protein: 0.5, fat: 0.4, carbs: 16, fiber: 1.6, isPublic: true, isVerified: true },
    { name: 'Гранат', brand: '', calories: 83, protein: 1.7, fat: 0.6, carbs: 19, fiber: 4, isPublic: true, isVerified: true },
    { name: 'Клубника', brand: '', calories: 32, protein: 0.8, fat: 0.4, carbs: 7.5, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Малина', brand: '', calories: 52, protein: 1.2, fat: 0.7, carbs: 11, fiber: 6.5, isPublic: true, isVerified: true },
    { name: 'Черника', brand: '', calories: 57, protein: 0.7, fat: 0.3, carbs: 14, fiber: 2.4, isPublic: true, isVerified: true },
    { name: 'Вишня', brand: '', calories: 50, protein: 1, fat: 0.3, carbs: 12, fiber: 1.7, isPublic: true, isVerified: true },
    { name: 'Слива', brand: '', calories: 46, protein: 0.7, fat: 0.3, carbs: 11, fiber: 1.4, isPublic: true, isVerified: true },
    { name: 'Персик', brand: '', calories: 39, protein: 0.9, fat: 0.3, carbs: 9.5, fiber: 1.5, isPublic: true, isVerified: true },
    { name: 'Абрикос', brand: '', calories: 48, protein: 1.4, fat: 0.4, carbs: 11, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Арбуз', brand: '', calories: 30, protein: 0.6, fat: 0.2, carbs: 7.5, fiber: 0.4, isPublic: true, isVerified: true },
    { name: 'Дыня', brand: '', calories: 34, protein: 0.8, fat: 0.2, carbs: 8, fiber: 0.9, isPublic: true, isVerified: true },
    { name: 'Авокадо', brand: '', calories: 160, protein: 2, fat: 15, carbs: 9, fiber: 6.7, isPublic: true, isVerified: true },
    { name: 'Лимон', brand: '', calories: 29, protein: 1.1, fat: 0.3, carbs: 9, fiber: 2.8, isPublic: true, isVerified: true },

    // Хлеб и выпечка
    { name: 'Хлеб Бородинский', brand: 'Коломенское', calories: 200, protein: 6.8, fat: 1.3, carbs: 39.8, fiber: 6.5, isPublic: true, isVerified: true },
    { name: 'Хлеб белый', brand: 'Коломенское', calories: 265, protein: 7.6, fat: 3.2, carbs: 50, fiber: 2.3, isPublic: true, isVerified: true },
    { name: 'Хлеб цельнозерновой', brand: 'Коломенское', calories: 247, protein: 10, fat: 3.4, carbs: 41, fiber: 7, isPublic: true, isVerified: true },
    { name: 'Батон нарезной', brand: 'Коломенское', calories: 262, protein: 7.5, fat: 2.9, carbs: 51, fiber: 2.2, isPublic: true, isVerified: true },
    { name: 'Лаваш тонкий', brand: '', calories: 277, protein: 9, fat: 2, carbs: 56, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Хлебцы ржаные', brand: 'Dr. Körner', calories: 310, protein: 11, fat: 3, carbs: 60, fiber: 15, isPublic: true, isVerified: true },

    // Сладости и снеки
    { name: 'Шоколад Алёнка', brand: 'Красный Октябрь', calories: 538, protein: 5.7, fat: 31.5, carbs: 57, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Зефир классический', brand: 'Шармэль', calories: 320, protein: 0.8, fat: 0.1, carbs: 79, fiber: 0.5, isPublic: true, isVerified: true },
    { name: 'Мармелад', brand: '', calories: 296, protein: 0.4, fat: 0.1, carbs: 76, fiber: 0.3, isPublic: true, isVerified: true },
    { name: 'Мёд натуральный', brand: 'Медовый край', calories: 304, protein: 0.3, fat: 0, carbs: 82, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сахар-песок', brand: 'Русский сахар', calories: 399, protein: 0, fat: 0, carbs: 99.8, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Печенье Юбилейное', brand: 'Юбилейное', calories: 463, protein: 7.5, fat: 19, carbs: 65, fiber: 1.5, isPublic: true, isVerified: true },
    { name: 'Пряники', brand: '', calories: 364, protein: 6, fat: 8, carbs: 72, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Вафли', brand: '', calories: 539, protein: 5, fat: 28, carbs: 65, fiber: 0.5, isPublic: true, isVerified: true },
    { name: 'Чипсы картофельные', brand: 'Lay\'s', calories: 536, protein: 5, fat: 34, carbs: 53, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Орехи грецкие', brand: '', calories: 654, protein: 15, fat: 65, carbs: 14, fiber: 6.7, isPublic: true, isVerified: true },
    { name: 'Миндаль', brand: '', calories: 579, protein: 21, fat: 50, carbs: 22, fiber: 12.5, isPublic: true, isVerified: true },
    { name: 'Арахис', brand: '', calories: 567, protein: 26, fat: 49, carbs: 16, fiber: 8.5, isPublic: true, isVerified: true },
    { name: 'Семечки подсолнечника', brand: 'Бабкины', calories: 584, protein: 21, fat: 51, carbs: 20, fiber: 8.6, isPublic: true, isVerified: true },

    // Соусы и приправы
    { name: 'Подсолнечное масло', brand: 'Олейна', calories: 899, protein: 0, fat: 99.9, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Оливковое масло', brand: 'Borges', calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Майонез классический', brand: 'Махеев', calories: 616, protein: 2, fat: 67, carbs: 3, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Кетчуп томатный', brand: 'Махеев', calories: 102, protein: 1.5, fat: 0.2, carbs: 24, fiber: 0.7, isPublic: true, isVerified: true },
    { name: 'Соевый соус', brand: 'Kikkoman', calories: 53, protein: 10, fat: 0, carbs: 3, fiber: 0, isPublic: true, isVerified: true },

    // Готовые блюда
    { name: 'Борщ классический', brand: '', calories: 57, protein: 3.8, fat: 2.9, carbs: 4.3, fiber: 1.2, isPublic: true, isVerified: true },
    { name: 'Щи из свежей капусты', brand: '', calories: 35, protein: 1.8, fat: 1.2, carbs: 4.5, fiber: 1.5, isPublic: true, isVerified: true },
    { name: 'Куриный суп с лапшой', brand: '', calories: 48, protein: 4, fat: 2, carbs: 4, fiber: 0.3, isPublic: true, isVerified: true },
    { name: 'Уха', brand: '', calories: 45, protein: 5, fat: 1.5, carbs: 3, fiber: 0.2, isPublic: true, isVerified: true },
    { name: 'Солянка сборная', brand: '', calories: 85, protein: 5, fat: 6, carbs: 3, fiber: 0.5, isPublic: true, isVerified: true },
    { name: 'Оливье (с колбасой)', brand: '', calories: 195, protein: 5.5, fat: 15.5, carbs: 7.8, fiber: 0.8, isPublic: true, isVerified: true },
    { name: 'Винегрет', brand: '', calories: 130, protein: 2, fat: 10, carbs: 8, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Селёдка под шубой', brand: '', calories: 210, protein: 6, fat: 16, carbs: 10, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Пельмени свино-говяжьи', brand: 'Сибирская коллекция', calories: 275, protein: 12, fat: 12, carbs: 29, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Вареники с картошкой', brand: '', calories: 180, protein: 5, fat: 2, carbs: 35, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Вареники с творогом', brand: '', calories: 220, protein: 10, fat: 5, carbs: 34, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Блинчики с творогом', brand: '', calories: 230, protein: 10, fat: 9, carbs: 27, fiber: 0.5, isPublic: true, isVerified: true },
    { name: 'Сырники (из творога 9%)', brand: 'ВкусВилл', calories: 220, protein: 18, fat: 10, carbs: 14, fiber: 0.5, isPublic: true, isVerified: true },
    { name: 'Голубцы с мясом', brand: '', calories: 120, protein: 7, fat: 6, carbs: 9, fiber: 2, isPublic: true, isVerified: true },
    { name: 'Плов с курицей', brand: '', calories: 180, protein: 8, fat: 7, carbs: 22, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Пицца Маргарита', brand: '', calories: 260, protein: 10, fat: 11, carbs: 30, fiber: 1.5, isPublic: true, isVerified: true },
    { name: 'Суши Калифорния', brand: '', calories: 170, protein: 7, fat: 6, carbs: 22, fiber: 0.5, isPublic: true, isVerified: true },
    { name: 'Ролл Филадельфия', brand: '', calories: 200, protein: 9, fat: 8, carbs: 23, fiber: 0.5, isPublic: true, isVerified: true },
    { name: 'Шаурма куриная', brand: '', calories: 250, protein: 15, fat: 12, carbs: 20, fiber: 1.5, isPublic: true, isVerified: true },
    { name: 'Чебурек', brand: '', calories: 330, protein: 10, fat: 18, carbs: 32, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Беляш', brand: '', calories: 350, protein: 12, fat: 20, carbs: 30, fiber: 1, isPublic: true, isVerified: true },
    { name: 'Омлет из 2 яиц на молоке', brand: '', calories: 180, protein: 13, fat: 14, carbs: 2, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Яичница из 2 яиц', brand: '', calories: 200, protein: 13, fat: 16, carbs: 1, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Греческий салат', brand: '', calories: 90, protein: 3, fat: 7, carbs: 4, fiber: 1.5, isPublic: true, isVerified: true },
    { name: 'Цезарь с курицей', brand: '', calories: 180, protein: 14, fat: 11, carbs: 8, fiber: 1, isPublic: true, isVerified: true },

    // Напитки
    { name: 'Чай чёрный без сахара', brand: '', calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Кофе без сахара', brand: '', calories: 2, protein: 0.1, fat: 0, carbs: 0.3, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Кофе с молоком (латте)', brand: '', calories: 56, protein: 3, fat: 2.5, carbs: 5, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Капучино без сахара', brand: '', calories: 45, protein: 2.5, fat: 2, carbs: 4, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Сок апельсиновый', brand: 'J7', calories: 45, protein: 0.7, fat: 0.2, carbs: 10, fiber: 0.2, isPublic: true, isVerified: true },
    { name: 'Сок яблочный', brand: 'J7', calories: 46, protein: 0.5, fat: 0.1, carbs: 11, fiber: 0.2, isPublic: true, isVerified: true },
    { name: 'Квас', brand: 'Очаковский', calories: 27, protein: 0.2, fat: 0, carbs: 5.2, fiber: 0, isPublic: true, isVerified: true },
    { name: 'Кефир 2.5%', brand: 'Домик в деревне', calories: 53, protein: 2.9, fat: 2.5, carbs: 4, fiber: 0, isPublic: true, isVerified: true },
  ];

  for (const product of products) {
    await prisma.foodItem.create({ data: product });
  }

  console.log(`✅ Добавлено ${products.length} продуктов!`);
}

main()
  .catch((e) => console.error('❌ Ошибка:', e))
  .finally(() => prisma.$disconnect());