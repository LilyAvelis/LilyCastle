'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { totalItems, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Логотип */}
        <Link href="/" className="hover:text-rose-500 transition">
          <span className="block text-xs text-stone-500 font-medium">Творческая мастерская</span>
          <span className="text-xl md:text-2xl font-bold text-stone-800">Забавный Страус 🌿</span>
        </Link>
        
        {/* Навигация - десктоп */}
        <nav className="hidden md:flex gap-8">
          <Link href="/" className="text-stone-700 hover:text-rose-400 transition font-medium">
            Главная
          </Link>
          <Link href="/catalog" className="text-stone-700 hover:text-rose-400 transition font-medium">
            Каталог
          </Link>
          <Link href="/contacts" className="text-stone-700 hover:text-rose-400 transition font-medium">
            Контакты
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Иконка корзины */}
          <button 
            onClick={openCart}
            className="relative p-2 text-stone-700 hover:text-rose-500 transition"
            aria-label="Корзина"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {/* Бургер-меню - мобайл */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-rose-500 transition"
            aria-label="Меню"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-6 pb-4 space-y-2 bg-stone-50/95 border-t border-stone-200">
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 text-stone-700 hover:text-rose-400 transition font-medium border-b border-stone-100"
          >
            🏠 Главная
          </Link>
          <Link 
            href="/catalog" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 text-stone-700 hover:text-rose-400 transition font-medium border-b border-stone-100"
          >
            🛍️ Каталог
          </Link>
          <Link 
            href="/contacts" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 text-stone-700 hover:text-rose-400 transition font-medium"
          >
            📞 Контакты
          </Link>
        </nav>
      </div>
    </header>
  );
}
