export default function Features() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-3 gap-12">
        {/* Свежесть */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="text-rose-400 text-5xl">🍃</div>
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Только свежее</h3>
          <p className="text-stone-600">
            Свежие фрукты, орехи и шоколад. Имеется санитарная книжка.
          </p>
        </div>

        {/* Авторский дизайн */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="text-rose-400 text-5xl">✨</div>
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Авторские букеты</h3>
          <p className="text-stone-600">
            Каждый букет — уникальная эмоция под любое событие
          </p>
        </div>

        {/* Доставка */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="text-rose-400 text-5xl">🚚</div>
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Доставка по Омску</h3>
          <p className="text-stone-600">
            150–350₽ через Яндекс.Курьер или самовывоз (5-я Армии, 14)
          </p>
        </div>
      </div>
    </section>
  );
}
