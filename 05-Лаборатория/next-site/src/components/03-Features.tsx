export default function Features() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-3 gap-12">
        {/* Свежесть */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="text-rose-400 text-5xl">🍃</div>
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Свежесть</h3>
          <p className="text-stone-600">
            Только свежие и качественные ингредиенты, собранные с любовью
          </p>
        </div>

        {/* Авторский дизайн */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="text-rose-400 text-5xl">✨</div>
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Авторский дизайн</h3>
          <p className="text-stone-600">
            Каждый букет — уникальное произведение искусства флориста
          </p>
        </div>

        {/* Доставка */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="text-rose-400 text-5xl">🚚</div>
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Быстрая доставка</h3>
          <p className="text-stone-600">
            Доставляем свежие букеты в течение 24 часов по всему городу
          </p>
        </div>
      </div>
    </section>
  );
}
