'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Target, TrendingDown, User } from 'lucide-react';

interface WeightLog {
  id: string;
  date: string;
  weight: number;
}

type Period = 'week' | 'month' | 'quarter' | 'year';

const periodLabels: Record<Period, string> = {
  week: 'Неделя',
  month: 'Месяц',
  quarter: 'Квартал',
  year: 'Год',
};

export default function WeightPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [weight, setWeight] = useState('');
  const [added, setAdded] = useState(false);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [period, setPeriod] = useState<Period>('week');
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);

  const loadLogs = () => {
    fetch('/api/weight')
      .then(r => r.json())
      .then(d => setLogs(d.logs || []));
  };

  useEffect(() => {
    loadLogs();
    fetch('/api/goals')
      .then(r => r.json())
      .then(d => {
        if (d.targetWeight) setTargetWeight(d.targetWeight);
        if (d.weight) setWeight(String(d.weight));
        if (d.height) setHeight(d.height);
      });
  }, []);

  const addWeight = async () => {
    if (!weight) return;
    await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight: parseFloat(weight) }),
    });
    setWeight('');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    loadLogs();
  };

  const changePeriod = (p: Period) => {
    setAnimating(true);
    setTimeout(() => {
      setPeriod(p);
      setOffset(0);
      setAnimating(false);
    }, 200);
  };

  const changeOffset = (dir: 'left' | 'right') => {
    setAnimating(true);
    setTimeout(() => {
      setOffset(o => dir === 'left' ? o - 1 : o + 1);
      setAnimating(false);
    }, 200);
  };

  const getDays = () => {
    const days: { date: string; label: string; log?: WeightLog }[] = [];
    const today = new Date();

    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i + offset * 7);
        const dateStr = d.toISOString().split('T')[0];
        const log = logs.find(l => l.date.startsWith(dateStr));
        days.push({ date: dateStr, label: d.toLocaleDateString('ru', { weekday: 'short' }), log });
      }
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i + offset * 30);
        const dateStr = d.toISOString().split('T')[0];
        const log = logs.find(l => l.date.startsWith(dateStr));
        days.push({ date: dateStr, label: d.toLocaleDateString('ru', { day: 'numeric' }), log });
      }
    } else {
      const count = period === 'quarter' ? 3 : 12;
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i + offset * count, 1);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const monthLogs = logs.filter(l => {
          const date = new Date(l.date);
          return date >= monthStart && date <= monthEnd;
        });
        const avgWeight = monthLogs.length > 0
          ? Math.round(monthLogs.reduce((sum, l) => sum + l.weight, 0) / monthLogs.length * 10) / 10
          : null;
        days.push({
          date: monthStart.toISOString().split('T')[0],
          label: monthStart.toLocaleDateString('ru', { month: 'short' }),
          log: avgWeight ? { id: '', date: '', weight: avgWeight } : undefined,
        });
      }
    }
    return days;
  };

  const days = getDays();
  const dayWeights = days.filter(d => d.log).map(d => d.log!.weight);
  const allVals = [...dayWeights, targetWeight || 80];
  const maxWeight = Math.max(...allVals, 80);
  const minWeight = Math.min(...allVals, 50) - 5;

  const allWeights = logs.map(l => l.weight);
  const lastWeight = allWeights.length > 0 ? allWeights[allWeights.length - 1] : null;
  const firstWeight = allWeights.length > 0 ? allWeights[0] : null;
  const delta = firstWeight && lastWeight ? (lastWeight - firstWeight).toFixed(1) : null;
  const bmi = lastWeight && height ? (lastWeight / ((height / 100) ** 2)).toFixed(1) : null;

  const getBarColor = (w: number) => {
    if (!targetWeight) return 'bg-cyan-500 dark:bg-cyan-400';
    const diff = w - targetWeight;
    const absDiff = Math.abs(diff);
    if (diff < -5) return 'bg-red-500 dark:bg-red-400';
    if (diff < -2) return 'bg-blue-500 dark:bg-blue-400';
    if (absDiff <= 2) return 'bg-cyan-500 dark:bg-cyan-400';
    if (diff > 2 && diff <= 5) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  const periodLabel = `${periodLabels[period]}${offset !== 0 ? (offset > 0 ? ` +${offset}` : ` ${offset}`) : ''}`;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 px-4 pt-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">📉 Вес</h1>

      {logs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Текущий</p><p className="text-lg font-bold text-black dark:text-white">{lastWeight} кг</p></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Цель</p><p className="text-lg font-bold text-black dark:text-white">{targetWeight || '—'} кг</p></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Изм.</p><p className={`text-lg font-bold ${delta && +delta < 0 ? 'text-cyan-500' : delta && +delta > 0 ? 'text-red-500' : 'text-black dark:text-white'}`}>{delta ? (delta.startsWith('-') ? delta : '+' + delta) : '—'} кг</p></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">ИМТ</p><p className={`text-lg font-bold ${bmi && +bmi >= 30 ? 'text-red-500' : bmi && +bmi >= 25 ? 'text-yellow-500' : 'text-cyan-500'}`}>{bmi || '—'}</p></div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4 flex gap-3">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Текущий вес (кг)" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm" />
        <button onClick={addWeight} className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold">{added ? '✅' : 'Добавить'}</button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <button key={p} onClick={() => changePeriod(p)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${period === p ? 'bg-cyan-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-600'}`}>{periodLabels[p]}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => changeOffset('right')} className="text-xl text-black dark:text-white px-2">◀</button>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{periodLabel}</h3>
          <button onClick={() => changeOffset('left')} className="text-xl text-black dark:text-white px-2">▶</button>
        </div>

        <div className={`h-64 flex items-end gap-1 transition-all duration-300 ${animating ? 'opacity-50 translate-x-2' : 'opacity-100 translate-x-0'}`}>
          {days.map((day) => {
            const w = day.log?.weight;
            const h = w ? ((w - minWeight) / (maxWeight - minWeight || 1)) * 100 : 0;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full relative">
                {w && <span className="text-xs font-semibold text-black dark:text-white mb-1">{w}</span>}
                <div className={`w-full rounded-t transition-all duration-500 ${w ? getBarColor(w) : 'bg-gray-200 dark:bg-gray-600'}`} style={{ height: `${Math.max(h, 4)}%` }} />
                <span className="text-xs text-gray-400 mt-2">{day.label}</span>
              </div>
            );
          })}
        </div>

        {targetWeight && (
          <div className="mt-2 text-xs text-gray-400 text-center border-t border-dashed border-gray-300 dark:border-gray-600 pt-2">
            — — цель: {targetWeight} кг — —
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-3">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition">
          <LayoutDashboard size={20} />
          <span className="text-xs">Дневник</span>
        </button>
        <button onClick={() => router.push('/goals')} className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition">
          <Target size={20} />
          <span className="text-xs">Цели</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-cyan-500 font-semibold">
          <TrendingDown size={20} />
          <span className="text-xs">Вес</span>
        </button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition">
          <User size={20} />
          <span className="text-xs">Профиль</span>
        </button>
      </div>
    </main>
  );
}