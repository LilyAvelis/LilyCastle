export default function Footer() {
  return (
    <footer className="bg-stone-100 text-stone-700">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Brand + Contacts */}
          <div>
            <h3 className="text-xl font-bold text-stone-800 mb-4">Забавный Страус 🌿</h3>
            <p className="text-stone-600 mb-4">Букеты, в которых растёт тепло. С 2018 года, более 5000 подарков 💝</p>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span>📱</span>
                <a href="tel:+79136280523" className="hover:text-rose-500 transition">+7 (913) 628-05-23</a>
              </p>
              <p className="flex items-center gap-2">
                <span>📍</span>
                <span>г. Омск, ул. 5-й Армии, 14</span>
              </p>
              <p className="flex items-center gap-2">
                <span>🕐</span>
                <span>09:00 – 22:00, без выходных</span>
              </p>
            </div>
          </div>

          {/* Соцсети */}
          <div className="md:text-right">
            <h4 className="font-semibold text-stone-800 mb-4">Мы в соцсетях</h4>
            <div className="flex gap-4 md:justify-end">
              <a 
                href="https://vk.com/straus_z" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110 transition"
                aria-label="VKontakte"
              >
                💙
              </a>
              <a 
                href="https://max.vk.com/straus_z" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110 transition"
                aria-label="Max"
              >
                💬
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-300 pt-8">
          <p className="text-sm text-center text-stone-600">
            © {new Date().getFullYear()} Забавный Страус. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
