'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';

interface AdminBarProps {
  onAddProduct: () => void;
  onManageCategories: () => void;
}

export default function AdminBar({ onAddProduct, onManageCategories }: AdminBarProps) {
  const { isAdmin, login, logout } = useAdmin();
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === 'straus') {
      login();
      setShowLogin(false);
    } else {
      alert('Неверный ключ');
    }
  };

  // Закрытие по Esc
  useEffect(() => {
    if (!showLogin) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLogin(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showLogin]);

  if (!isAdmin) {
    return (
      <>
        {/* Кнопка входа (Страус) */}
        <button 
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-stone-100 hover:bg-rose-100 transition shadow-lg z-[50] flex items-center justify-center text-3xl overflow-hidden border-4 border-white cursor-pointer" 
          onClick={() => setShowLogin(true)} 
          title="Вход для страусов" 
        >
          🐦
        </button>
        
        {showLogin && (
          <div 
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowLogin(false)}
          >
            <div 
              className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">🧐</div>
              <h2 className="text-2xl font-bold mb-2 text-black">Вы гость?</h2>
              <p className="text-stone-800 mb-6 text-lg font-medium">Тогда вам не сюда.</p>
              
              <div className="bg-stone-100 rounded-xl p-6 mb-6">
                <p className="font-bold text-black mb-4">Вы страус? <br/>Тогда введите страусиный пароль:</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Страусиный пароль..."
                  className="w-full p-4 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-rose-500 text-center text-lg text-black"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowLogin(false)} className="flex-1 py-4 rounded-xl text-stone-600 font-bold hover:bg-stone-200 transition">
                  Я просто гость
                </button>
                <button onClick={handleLogin} className="flex-1 py-4 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition">
                  Войти
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="bg-stone-900 text-white py-3 px-6 sticky top-0 z-[60] flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-4">
        <span className="font-mono text-rose-400 font-bold">ADMIN MODE</span>
        <span className="text-stone-500 text-sm">|</span>
        <button 
          onClick={onAddProduct}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-2"
        >
          <span>➕</span> Добавить товар
        </button>
        <button 
          onClick={onManageCategories}
          className="bg-stone-700 hover:bg-stone-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-2"
        >
          <span>📂</span> Категории
        </button>
      </div>
      <button onClick={logout} className="text-stone-400 hover:text-white text-sm underline">
        Выйти
      </button>
    </div>
  );
}
