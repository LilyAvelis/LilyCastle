export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Левая часть */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-stone-800 mb-6">
            Вкусные эмоции в каждом букете
          </h1>
          <p className="text-lg text-stone-600 mb-8">
            Авторские съедобные композиции, созданные с любовью и вкусом
          </p>
          <button className="bg-rose-400 text-white px-8 py-3 rounded-lg hover:bg-rose-500 transition text-lg font-semibold">
            Выбрать букет
          </button>
        </div>
        
        {/* Правая часть - плейсхолдер */}
        <div className="bg-stone-200 rounded-2xl aspect-square flex items-center justify-center">
          <svg 
            className="w-24 h-24 text-stone-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
