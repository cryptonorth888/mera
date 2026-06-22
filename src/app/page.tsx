'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Target, TrendingDown, User, MessageCircle } from 'lucide-react';

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

  const [barcodeInput, setBarcodeInput] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [showOscar, setShowOscar] = useState(false);
  const [oscarPrompt, setOscarPrompt] = useState('');
  const [oscarMessages, setOscarMessages] = useState<{ role: string; content: string }[]>([]);
  const [oscarLoading, setOscarLoading] = useState(false);
  const oscarChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (oscarChatEndRef.current) {
      oscarChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [oscarMessages]);

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
    setBarcodeInput('');
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
      <div className="bg-cyan-500 dark:bg-cyan-700 text-white px-4 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Сегодня</p>
            <p className="text-xl font-bold">{data.date}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOscar(true)}
              className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition"
              title="Оскар"
            >
              <MessageCircle size={20} />
              <span className="text-[10px]">Оскар</span>
            </button>
            <p className="text-lg font-semibold">Привет, {data.userName || 'Друг'}!</p>
          </div>
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
              <span className="text-3xl font-bold font-mono">{data.consumed.calories}</span>
              <span className="text-sm opacity-80">из <span className="font-mono">{data.goals.calories}</span> ккал</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div><p className="font-semibold font-mono">{data.consumed.protein}г</p><p className="opacity-70">Белки</p><p className="text-xs opacity-50"><span className="font-mono">{data.goals.protein}</span>г</p></div>
          <div><p className="font-semibold font-mono">{data.consumed.fat}г</p><p className="opacity-70">Жиры</p><p className="text-xs opacity-50"><span className="font-mono">{data.goals.fat}</span>г</p></div>
          <div><p className="font-semibold font-mono">{data.consumed.carbs}г</p><p className="opacity-70">Углеводы</p><p className="text-xs opacity-50"><span className="font-mono">{data.goals.carbs}</span>г</p></div>
        </div>
      </div>

      <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-black dark:text-white">💧 Вода</p>
          <button onClick={addWater} className="text-blue-500 text-xl font-bold leading-none hover:scale-110 active:scale-90 transition-transform">+</button>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-400 h-2 rounded-full transition-all"
            style={{ width: `${Math.min((data.water.consumed / data.water.goal) * 100, 100)}%` }} />
        </div>
        <p className="text-sm text-black dark:text-gray-300 mt-1"><span className="font-mono">{data.water.consumed}</span> мл из <span className="font-mono">{data.water.goal}</span> мл</p>
      </div>

      <div className="mx-4 mt-4 space-y-3">
        {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
          const meal = data.meals.find((m) => m.mealType === type);
          return (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm card-enter">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-black dark:text-white">{mealTypeLabels[type]}</p>
                <button onClick={() => openModal(type)} className="text-cyan-500 text-xl font-bold leading-none hover:scale-110 active:scale-90 transition-transform">+</button>
              </div>
              {meal && meal.entries.length > 0 ? (
                <ul className="space-y-1">
                  {meal.entries.map((entry) => (
                    <li key={entry.id} className="flex justify-between text-sm text-black dark:text-gray-200 items-center">
                      <span>{entry.foodName} ({entry.servings}г)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono">{entry.calories} ккал</span>
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
        <button className="flex flex-col items-center gap-1 text-cyan-500 font-semibold">
          <LayoutDashboard size={20} />
          <span className="text-xs">Дневник</span>
        </button>
        <button onClick={() => router.push('/goals')} className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition">
          <Target size={20} />
          <span className="text-xs">Цели</span>
        </button>
        <button onClick={() => router.push('/weight')} className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition">
          <TrendingDown size={20} />
          <span className="text-xs">Вес</span>
        </button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition">
          <User size={20} />
          <span className="text-xs">Профиль</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center" style={{ paddingTop: '15vh' }}>
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 flex flex-col" style={{ maxHeight: '70vh' }}>
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-black dark:text-white">
                Добавить в {mealTypeLabels[currentMealType]}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-black dark:text-white text-xl">✕</button>
            </div>

            <div className="flex-shrink-0">
              <input
                type="text"
                placeholder="Поиск продуктов..."
                value={searchQuery}
                onChange={(e) => doSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-black dark:text-white dark:bg-gray-700"
                autoFocus
              />

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Штрихкод (вручную)"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                />
                <button
                  onClick={async () => {
                    if (!barcodeInput) return;
                    const res = await fetch(`/api/food/barcode/${barcodeInput}`);
                    const data = await res.json();
                    if (data.product) {
                      setSelectedProduct(data.product);
                      setBarcodeInput('');
                    } else {
                      alert('Продукт не найден в базе.');
                    }
                  }}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold"
                >
                  🔍
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSearchResults([]);
                  setSearchQuery('');
                  setShowCustomForm(!showCustomForm);
                }}
                className="w-full py-2 text-sm text-cyan-500 dark:text-cyan-400 border border-dashed border-cyan-400 dark:border-cyan-600 rounded-xl mb-3 hover:bg-cyan-50 dark:hover:bg-cyan-900 transition"
              >
                ➕ Свой продукт
              </button>
            </div>

            <div className="overflow-y-auto">
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
                    <div className="bg-cyan-50 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
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
                    className="w-full py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
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
                      className={`p-3 rounded-xl cursor-pointer border dark:border-gray-600 ${selectedProduct?.id === p.id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900' : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      <p className="font-medium text-black dark:text-white">{p.name}</p>
                      {p.brand && <p className="text-xs text-black dark:text-gray-400">{p.brand}</p>}
                      <p className="text-sm text-black dark:text-gray-300"><span className="font-mono">{p.calories}</span> ккал | Б:<span className="font-mono">{p.protein}</span> Ж:<span className="font-mono">{p.fat}</span> У:<span className="font-mono">{p.carbs}</span></p>
                    </div>
                  ))}
                </div>
              )}

              {selectedProduct && (
                <div className="border-t dark:border-gray-600 pt-4">
                  <p className="font-semibold text-black dark:text-white mb-2">{selectedProduct.name}</p>
                  <p className="text-sm text-black dark:text-gray-300 mb-3">
                    На 100г: <span className="font-mono">{selectedProduct.calories}</span> ккал | Б:<span className="font-mono">{selectedProduct.protein}</span> Ж:<span className="font-mono">{selectedProduct.fat}</span> У:<span className="font-mono">{selectedProduct.carbs}</span>
                  </p>
                  <label className="block text-sm font-medium text-black dark:text-white mb-1">Граммы: <span className="font-mono">{servings}</span>г</label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-full mb-2"
                  />
                  <p className="text-sm text-cyan-500 font-medium font-mono">
                    Итого: {Math.round(selectedProduct.calories * servings / 100)} ккал
                  </p>
                  <button
                    onClick={addProduct}
                    disabled={adding}
                    className="w-full mt-3 py-3 bg-cyan-500 text-white font-semibold rounded-xl hover:bg-cyan-600 disabled:opacity-50"
                  >
                    {adding ? 'Добавление...' : 'Добавить'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showOscar && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md mx-0 sm:mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-3 border-b dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐱</span>
                <div>
                  <h3 className="font-bold text-black dark:text-white text-lg">Оскар</h3>
                  <p className="text-xs text-gray-400">Персональный ИИ-диетолог</p>
                </div>
              </div>
              <button onClick={() => setShowOscar(false)} className="text-black dark:text-white text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[50vh] space-y-3 mb-3 pr-1">
              {oscarMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-cyan-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={oscarChatEndRef} />
              {oscarLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-2 text-sm text-gray-400">
                    Оскар печатает...
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={oscarPrompt}
                onChange={(e) => setOscarPrompt(e.target.value)}
                placeholder="Спроси Оскара..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && oscarPrompt.trim()) {
                    const userMsg = { role: 'user', content: oscarPrompt };
                    setOscarMessages([...oscarMessages, userMsg]);
                    setOscarPrompt('');
                    setOscarLoading(true);
                    fetch('/api/oscar', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt: oscarPrompt }),
                    })
                      .then(r => r.json())
                      .then(d => {
                        setOscarMessages(prev => [...prev, { role: 'assistant', content: d.reply }]);
                        setOscarLoading(false);
                      });
                  }
                }}
              />
              <button
                onClick={() => {
                  if (!oscarPrompt.trim()) return;
                  const userMsg = { role: 'user', content: oscarPrompt };
                  setOscarMessages([...oscarMessages, userMsg]);
                  setOscarPrompt('');
                  setOscarLoading(true);
                  fetch('/api/oscar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: oscarPrompt }),
                  })
                    .then(r => r.json())
                    .then(d => {
                      setOscarMessages(prev => [...prev, { role: 'assistant', content: d.reply }]);
                      setOscarLoading(false);
                    });
                }}
                disabled={oscarLoading}
                className="px-4 py-2 bg-cyan-500 text-white rounded-full text-sm font-semibold disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}