import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Левая часть */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-stone-800 mb-6">
            Съедобные букеты от Страуса 🌿
          </h1>
          <p className="text-lg text-stone-600 mb-4">
            Фрукты, орехи, шоколад — каждый букет как признание в любви
          </p>
          <p className="text-stone-500 mb-8">
            Более 5000 счастливых подарков 💝 • Доставка по Омску
          </p>
          <Link 
            href="/catalog"
            className="inline-block bg-rose-400 text-white px-8 py-3 rounded-lg hover:bg-rose-500 transition text-lg font-semibold shadow-lg shadow-rose-200"
          >
            В каталог →
          </Link>
        </div>
        
        {/* Правая часть - фото */}
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
          <Image 
            src="/monster.png"
            alt="Съедобный букет от Забавного Страуса"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
