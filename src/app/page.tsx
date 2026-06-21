'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface MealEntry {
  id: string;
  foodName: string;
  servings: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
interface Meal {
  id: string;
  mealType: string;
  entries: MealEntry[];
}
interface DailyData {
  date: string;
  userName: string;
  goals: { calories: number; protein: number; fat: number; carbs: number };
  consumed: { calories: number; protein: number; fat: number; carbs: number };
  water: { consumed: number; goal: number };
  meals: Meal[];
}
interface FoodProduct {
  id: string;
  name: string;
  brand: string | null;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [currentMealType, setCurrentMealType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<FoodProduct | null>(null);
  const [servings, setServings] = useState(100);
  const [adding, setAdding] = useState(false);

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFiber, setCustomFiber] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const loadData = useCallback(() => {
    fetch('/api/daily-summary')
      .then((res) => {
        if (res.status === 401) { router.push('/login'); return null; }
        return res.json();
      })
      .then((json) => {
        if (json && !json.error) setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const doSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 1) { setSearchResults([]); return; }
    const res = await fetch(`/api/food/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    setSearchResults(json.products || []);
  };

  const openModal = (mealType: string) => {
    setCurrentMealType(mealType);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProduct(null);
    setServings(100);
    setShowCustomForm(false);
    setCreateMessage('');
    setShowModal(true);
  };

  const addProduct = async () => {
    if (!selectedProduct) return;
    setAdding(true);
    const res = await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mealType: currentMealType,
        foodItemId: selectedProduct.id,
        servings,
      }),
    });
    if (res.ok) {
      setShowModal(false);
      loadData();
    }
    setAdding(false);
  };

  const deleteEntry = async (entryId: string) => {
    await fetch(`/api/meals/${entryId}`, { method: 'DELETE' });
    loadData();
  };

  const addWater = async () => {
    await fetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountMl: 200 }),
    });
    loadData();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-black dark:text-white text-lg">Загрузка...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-black dark:text-white text-lg">Нет данных</p>
      </main>
    );
  }

  const caloriePercent = Math.min(
    Math.round((data.consumed.calories / data.goals.calories) * 100), 100
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="bg-green-600 dark:bg-green-800 text-white px-4 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Сегодня</p>
            <p className="text-xl font-bold">{data.date}</p>
          </div>
          <p className="text-lg font-semibold">Привет, {data.userName || 'Друг'}!</p>
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${caloriePercent * 2.51} 251`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{data.consumed.calories}</span>
              <span className="text-sm opacity-80">из {data.goals.calories} ккал</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div><p className="font-semibold">{data.consumed.protein}г</p><p className="opacity-70">Белки</p><p className="text-xs opacity-50">{data.goals.protein}г</p></div>
          <div><p className="font-semibold">{data.consumed.fat}г</p><p className="opacity-70">Жиры</p><p className="text-xs opacity-50">{data.goals.fat}г</p></div>
          <div><p className="font-semibold">{data.consumed.carbs}г</p><p className="opacity-70">Углеводы</p><p className="text-xs opacity-50">{data.goals.carbs}г</p></div>
        </div>
      </div>

      <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-black dark:text-white">💧 Вода</p>
          <button onClick={addWater} className="text-blue-500 text-xl font-bold leading-none">+</button>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-400 h-2 rounded-full transition-all"
            style={{ width: `${Math.min((data.water.consumed / data.water.goal) * 100, 100)}%` }} />
        </div>
        <p className="text-sm text-black dark:text-gray-300 mt-1">{data.water.consumed} мл из {data.water.goal} мл</p>
      </div>

      <div className="mx-4 mt-4 space-y-3">
        {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
          const meal = data.meals.find((m) => m.mealType === type);
          return (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-black dark:text-white">{mealTypeLabels[type]}</p>
                <button onClick={() => openModal(type)} className="text-green-600 text-xl font-bold leading-none">+</button>
              </div>
              {meal && meal.entries.length > 0 ? (
                <ul className="space-y-1">
                  {meal.entries.map((entry) => (
                    <li key={entry.id} className="flex justify-between text-sm text-black dark:text-gray-200 items-center">
                      <span>{entry.foodName} ({entry.servings}г)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.calories} ккал</span>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-500 hover:text-red-700 text-lg leading-none ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-black dark:text-gray-400">Нет записей</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-3">
        <button className="text-green-600 font-semibold">📋 Дневник</button>
        <button onClick={() => router.push('/goals')} className="text-black dark:text-white">🎯 Цели</button>
        <button onClick={() => router.push('/weight')} className="text-black dark:text-white">📉 Вес</button>
        <button onClick={() => router.push('/profile')} className="text-black dark:text-white">👤 Профиль</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black dark:text-white">
                Добавить в {mealTypeLabels[currentMealType]}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-black dark:text-white text-xl">✕</button>
            </div>

            <input
              type="text"
              placeholder="Поиск продуктов..."
              value={searchQuery}
              onChange={(e) => doSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-black dark:text-white dark:bg-gray-700"
              autoFocus
            />

            <button
              onClick={() => {
                setSelectedProduct(null);
                setSearchResults([]);
                setSearchQuery('');
                setShowCustomForm(!showCustomForm);
              }}
              className="w-full py-2 text-sm text-green-600 dark:text-green-400 border border-dashed border-green-400 dark:border-green-600 rounded-xl mb-3 hover:bg-green-50 dark:hover:bg-green-900 transition"
            >
              ➕ Свой продукт
            </button>

            {showCustomForm && (
              <div className="border-t dark:border-gray-600 pt-4 space-y-3 mb-4">
                <h3 className="font-semibold text-black dark:text-white">Новый продукт</h3>
                <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Название *" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                <input type="text" value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} placeholder="Бренд (необязательно)" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Пищевая ценность на 100 г продукта</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={customCalories} onChange={(e) => setCustomCalories(e.target.value)} placeholder="Ккал *" className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                  <input type="number" value={customProtein} onChange={(e) => setCustomProtein(e.target.value)} placeholder="Белки (г) *" className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                  <input type="number" value={customFat} onChange={(e) => setCustomFat(e.target.value)} placeholder="Жиры (г) *" className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                  <input type="number" value={customCarbs} onChange={(e) => setCustomCarbs(e.target.value)} placeholder="Углеводы (г) *" className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                </div>
                <input type="number" value={customFiber} onChange={(e) => setCustomFiber(e.target.value)} placeholder="Клетчатка (г)" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                {createMessage && (
                  <div className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
                    {createMessage}
                  </div>
                )}
                <button
                  onClick={async () => {
                    setCreating(true);
                    setCreateMessage('');
                    const res = await fetch('/api/food/create', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: customName,
                        brand: customBrand,
                        calories: parseFloat(customCalories),
                        protein: parseFloat(customProtein),
                        fat: parseFloat(customFat),
                        carbs: parseFloat(customCarbs),
                        fiber: customFiber ? parseFloat(customFiber) : 0,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setCreateMessage(data.becamePublic ? '✅ Продукт добавлен в общую базу!' : '✅ Продукт успешно сохранён!');
                      setCustomName(''); setCustomBrand(''); setCustomCalories(''); setCustomProtein(''); setCustomFat(''); setCustomCarbs(''); setCustomFiber('');
                      if (data.product) {
                        setSelectedProduct(data.product);
                        setShowCustomForm(false);
                      }
                      setTimeout(() => setCreateMessage(''), 3000);
                    } else {
                      setCreateMessage('❌ ' + (data.error || 'Ошибка'));
                    }
                    setCreating(false);
                  }}
                  disabled={creating}
                  className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {creating ? 'Создание...' : 'Создать продукт'}
                </button>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 mb-4">
                {searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); setSearchResults([]); setSearchQuery(''); }}
                    className={`p-3 rounded-xl cursor-pointer border dark:border-gray-600 ${selectedProduct?.id === p.id ? 'border-green-500 bg-green-50 dark:bg-green-900' : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    <p className="font-medium text-black dark:text-white">{p.name}</p>
                    {p.brand && <p className="text-xs text-black dark:text-gray-400">{p.brand}</p>}
                    <p className="text-sm text-black dark:text-gray-300">{p.calories} ккал | Б:{p.protein} Ж:{p.fat} У:{p.carbs}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedProduct && (
              <div className="border-t dark:border-gray-600 pt-4">
                <p className="font-semibold text-black dark:text-white mb-2">{selectedProduct.name}</p>
                <p className="text-sm text-black dark:text-gray-300 mb-3">
                  На 100г: {selectedProduct.calories} ккал | Б:{selectedProduct.protein} Ж:{selectedProduct.fat} У:{selectedProduct.carbs}
                </p>
                <label className="block text-sm font-medium text-black dark:text-white mb-1">Граммы: {servings}г</label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full mb-2"
                />
                <p className="text-sm text-green-600 font-medium">
                  Итого: {Math.round(selectedProduct.calories * servings / 100)} ккал
                </p>
                <button
                  onClick={addProduct}
                  disabled={adding}
                  className="w-full mt-3 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  {adding ? 'Добавление...' : 'Добавить'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}