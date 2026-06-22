'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Target, TrendingDown, User, Sun, Moon, Monitor } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<string>('system');

  useEffect(() => {
    fetch('/api/profile')
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null; }
        return r.json();
      })
      .then(d => {
        if (d?.user) {
          setUser(d.user);
          setName(d.user.name || '');
        }
        setLoading(false);
      });

    const saved = localStorage.getItem('theme') || 'system';
    setTheme(saved);
  }, [router]);

  const handleSave = async () => {
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const changeTheme = (t: string) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };

  if (loading) return <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><p className="text-black dark:text-white">Загрузка...</p></main>;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 px-4 pt-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">👤 Профиль</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4 flex items-center gap-4">
        <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-semibold text-black dark:text-white text-lg">{user?.name || 'Пользователь'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            С нами с {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru') : '...'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4 space-y-3">
        <h2 className="font-semibold text-gray-700 dark:text-white">Имя</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm"
          placeholder="Ваше имя"
        />
        <button onClick={handleSave} className="w-full py-3 bg-cyan-500 text-white rounded-xl font-semibold">
          {saved ? '✅ Сохранено!' : 'Сохранить'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
        <h2 className="font-semibold text-gray-700 dark:text-white mb-3">Настройки</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Тема оформления</p>
        <div className="flex gap-2">
          <button
            onClick={() => changeTheme('light')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
              theme === 'light' ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white'
            }`}
          >
            <Sun size={16} /> Светлая
          </button>
          <button
            onClick={() => changeTheme('dark')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
              theme === 'dark' ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white'
            }`}
          >
            <Moon size={16} /> Тёмная
          </button>
          <button
            onClick={() => changeTheme('system')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
              theme === 'system' ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white'
            }`}
          >
            <Monitor size={16} /> Авто
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
        <h2 className="font-semibold text-gray-700 dark:text-white mb-3">Статистика</h2>
        <div className="space-y-2 text-sm">
          <p className="text-black dark:text-white">Цель: {user?.dailyCalorieGoal || '—'} ккал/день</p>
          <p className="text-black dark:text-white">Текущий вес: {user?.weight || '—'} кг</p>
          <p className="text-black dark:text-white">Целевой вес: {user?.targetWeight || '—'} кг</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
      >
        Выйти
      </button>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-3">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition">
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
        <button className="flex flex-col items-center gap-1 text-cyan-500 font-semibold">
          <User size={20} />
          <span className="text-xs">Профиль</span>
        </button>
      </div>
    </main>
  );
}