'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Target, TrendingDown, User } from 'lucide-react';

export default function GoalsPage() {
  const router = useRouter();
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(100);
  const [fat, setFat] = useState(65);
  const [carbs, setCarbs] = useState(250);
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [weightGoal, setWeightGoal] = useState('maintain');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [estimatedDays, setEstimatedDays] = useState<number | null>(null);
  const [weightWarning, setWeightWarning] = useState('');

  useEffect(() => {
    fetch('/api/goals')
      .then((res) => {
        if (res.status === 401) { router.push('/login'); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCalories(data.calories);
          setProtein(data.protein);
          setFat(data.fat);
          setCarbs(data.carbs);
          if (data.weight) setWeight(String(data.weight));
          if (data.targetWeight) setTargetWeight(String(data.targetWeight));
          if (data.weightGoal) setWeightGoal(data.weightGoal);
          if (data.height) setHeight(String(data.height));
          if (data.age) setAge(String(data.age));
          if (data.gender) setGender(data.gender);
          if (data.activityLevel) setActivityLevel(data.activityLevel);
        }
        setLoading(false);
      });
  }, [router]);

  const handleWeightChange = (val: string, type: 'current' | 'target') => {
    const w = parseFloat(val);
    const cw = type === 'current' ? w : parseFloat(weight);
    const tw = type === 'target' ? w : parseFloat(targetWeight);
    
    if (type === 'current') setWeight(val);
    else setTargetWeight(val);

    if (!cw || !tw || isNaN(cw) || isNaN(tw)) {
      setWeightWarning('');
      return;
    }

    if (weightGoal === 'lose' && tw >= cw) {
      setWeightWarning('Для снижения веса целевой вес должен быть меньше текущего');
    } else if (weightGoal === 'gain' && tw <= cw) {
      setWeightWarning('Для набора веса целевой вес должен быть больше текущего');
    } else {
      setWeightWarning('');
    }
  };

  const calcEstimate = () => {
    const w = weight ? parseFloat(weight) : null;
    const tw = targetWeight ? parseFloat(targetWeight) : null;
    if (!w || !tw || weightGoal === 'maintain') {
      setEstimatedDays(null);
      return;
    }
    const diff = Math.abs(w - tw);
    const days = Math.round((diff * 7700) / 500);
    setEstimatedDays(days);
  };

  const autoCalculate = () => {
    const w = targetWeight ? parseFloat(targetWeight) : weight ? parseFloat(weight) : null;
    if (!w || !height || !age || !gender) return;
    const h = parseFloat(height);
    const a = parseInt(age);
    let bmr = 0;
    if (gender === 'male') bmr = 10 * w + 6.25 * h - 5 * a + 5;
    else bmr = 10 * w + 6.25 * h - 5 * a - 161;
    const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extreme: 1.9 };
    const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.2));
    if (weightGoal === 'gain') setCalories(tdee + 300);
    else if (weightGoal === 'lose') setCalories(tdee - 300);
    else setCalories(tdee);
    setProtein(Math.round((tdee * 0.3) / 4));
    setFat(Math.round((tdee * 0.25) / 9));
    setCarbs(Math.round((tdee * 0.45) / 4));
    calcEstimate();
  };

  const handleSave = async () => {
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calories, protein, fat, carbs,
        weight: weight ? parseFloat(weight) : null,
        targetWeight: weightGoal === 'maintain' ? (weight ? parseFloat(weight) : null) : (targetWeight ? parseFloat(targetWeight) : null),
        weightGoal: weightGoal || 'maintain',
        height: height ? parseFloat(height) : null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        activityLevel: activityLevel || null,
      }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  if (loading) return <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><p className="text-black dark:text-white">Загрузка...</p></main>;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 px-4 pt-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">🎯 Цели</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4 space-y-3">
        <h2 className="font-semibold text-gray-700 dark:text-white">Ваши данные</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Текущий вес (кг)</label><input type="number" value={weight} onChange={(e) => handleWeightChange(e.target.value, 'current')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" placeholder="80" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Целевой вес (кг)</label><input type="number" value={weightGoal === 'maintain' ? weight : targetWeight} onChange={(e) => handleWeightChange(e.target.value, 'target')} disabled={weightGoal === 'maintain'} className={`w-full px-3 py-2 border rounded-lg text-sm ${weightGoal === 'maintain' ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'}`} placeholder={weightGoal === 'maintain' ? 'Не требуется' : 'Введите целевой вес'} /></div>
          <div className="col-span-2"><label className="text-sm text-gray-500 dark:text-gray-400">Цель по весу</label>
            <select value={weightGoal} onChange={(e) => {
              setWeightGoal(e.target.value);
              const cw = parseFloat(weight);
              const tw = parseFloat(targetWeight);
              if (!isNaN(cw) && !isNaN(tw)) {
                if (e.target.value === 'lose' && tw >= cw) setWeightWarning('Целевой вес должен быть меньше текущего');
                else if (e.target.value === 'gain' && tw <= cw) setWeightWarning('Целевой вес должен быть больше текущего');
                else setWeightWarning('');
              }
            }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
              <option value="maintain">Удерживать вес</option>
              <option value="lose">Сбросить вес</option>
              <option value="gain">Набрать вес</option>
            </select>
          </div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Рост (см)</label><input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" placeholder="175" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Возраст</label><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" placeholder="30" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Пол</label><select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"><option value="">Выбрать</option><option value="male">Мужской</option><option value="female">Женский</option></select></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Активность</label><select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"><option value="">Выбрать</option><option value="sedentary">Сидячий</option><option value="light">Лёгкая</option><option value="moderate">Средняя</option><option value="active">Высокая</option><option value="extreme">Экстремальная</option></select></div>
        </div>
        {weightWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-sm p-3 rounded-lg">
            {weightWarning}
          </div>
        )}
        <button onClick={autoCalculate} className="w-full py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600">Рассчитать норму</button>
      </div>

      {estimatedDays !== null && weightGoal !== 'maintain' && !weightWarning && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Примерное время достижения цели</p>
          <p className="text-2xl font-bold text-cyan-500 dark:text-cyan-400">
            {estimatedDays} {estimatedDays === 1 ? 'день' : estimatedDays < 5 ? 'дня' : 'дней'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            * Результат является приблизительным и зависит от вашего метаболизма, физической активности и других факторов
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-700 dark:text-white">Дневные нормы</h2>
        <div><label className="text-sm text-gray-500 dark:text-gray-400">Калории (ккал)</label><input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-lg font-bold" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Белки (г)</label><input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Жиры (г)</label><input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Углеводы (г)</label><input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" /></div>
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-cyan-500 text-white font-semibold rounded-xl hover:bg-cyan-600">{saved ? '✅ Сохранено!' : 'Сохранить'}</button>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-3">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition">
          <LayoutDashboard size={20} />
          <span className="text-xs">Дневник</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-cyan-500 font-semibold">
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
    </main>
  );
}