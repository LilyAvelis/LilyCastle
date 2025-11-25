import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-stone-100 text-stone-700">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">SweetBouquet</h3>
            <p className="text-sm text-stone-600">Вкусные букеты с любовью 🌹</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-stone-800 mb-4">Меню</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#catalog" className="hover:text-rose-400 transition">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-rose-400 transition">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="#contacts" className="hover:text-rose-400 transition">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold text-stone-800 mb-4">Контакты</h4>
            <p className="text-sm mb-1">📱 +7 (999) 123-45-67</p>
            <p className="text-sm">📧 hello@sweetbouquet.ru</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-300 pt-8">
          <p className="text-sm text-center text-stone-600">
            © 2024 SweetBouquet. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
