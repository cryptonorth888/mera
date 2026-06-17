'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoalsPage() {
  const router = useRouter();
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(100);
  const [fat, setFat] = useState(65);
  const [carbs, setCarbs] = useState(250);
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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
          if (data.height) setHeight(String(data.height));
          if (data.age) setAge(String(data.age));
          if (data.gender) setGender(data.gender);
          if (data.activityLevel) setActivityLevel(data.activityLevel);
        }
        setLoading(false);
      });
  }, [router]);

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
    setCalories(tdee);
    setProtein(Math.round((tdee * 0.3) / 4));
    setFat(Math.round((tdee * 0.25) / 9));
    setCarbs(Math.round((tdee * 0.45) / 4));
  };

  const handleSave = async () => {
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calories, protein, fat, carbs,
        weight: weight ? parseFloat(weight) : null,
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
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
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Текущий вес (кг)</label><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" placeholder="80" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Целевой вес (кг)</label><input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" placeholder="75" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Рост (см)</label><input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" placeholder="175" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Возраст</label><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" placeholder="30" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Пол</label><select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"><option value="">Выбрать</option><option value="male">Мужской</option><option value="female">Женский</option></select></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Активность</label><select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"><option value="">Выбрать</option><option value="sedentary">Сидячий</option><option value="light">Лёгкая</option><option value="moderate">Средняя</option><option value="active">Высокая</option><option value="extreme">Экстремальная</option></select></div>
        </div>
        <button onClick={autoCalculate} className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">Рассчитать норму</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-700 dark:text-white">Дневные нормы</h2>
        <div><label className="text-sm text-gray-500 dark:text-gray-400">Калории (ккал)</label><input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-lg font-bold" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Белки (г)</label><input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Жиры (г)</label><input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" /></div>
          <div><label className="text-sm text-gray-500 dark:text-gray-400">Углеводы (г)</label><input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" /></div>
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700">{saved ? '✅ Сохранено!' : 'Сохранить'}</button>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-3">
        <button onClick={() => router.push('/')} className="text-black dark:text-white">📋 Дневник</button>
        <button className="text-green-600 font-semibold">🎯 Цели</button>
        <button onClick={() => router.push('/weight')} className="text-black dark:text-white">📉 Вес</button>
      </div>
    </main>
  );
}