import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Логотип */}
        <Link href="/" className="text-2xl font-bold text-stone-800 hover:text-rose-500 transition">
          SweetBouquet 🌹
        </Link>
        
        {/* Навигация */}
        <nav className="hidden md:flex gap-8">
          <Link href="/" className="text-stone-700 hover:text-rose-400 transition font-medium">
            О нас
          </Link>
          <Link href="/catalog" className="text-stone-700 hover:text-rose-400 transition font-medium">
            Каталог
          </Link>
        </nav>
        
        {/* Кнопка */}
        <button className="bg-rose-400 text-white px-6 py-2 rounded-lg hover:bg-rose-500 transition shadow-md shadow-rose-100">
          Заказать
        </button>
      </div>
    </header>
  );
}
