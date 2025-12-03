import Header from '@/components/01-Header';
import Footer from '@/components/05-Footer';

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <main className="pt-12 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 text-center">
            Контакты
          </h1>
          <p className="text-stone-600 text-lg text-center mb-12 max-w-2xl mx-auto">
            Свяжитесь со мной любым удобным способом
          </p>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Контактная информация */}
              <div>
                <h2 className="text-2xl font-bold text-stone-800 mb-6">Как со мной связаться</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      📱
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 mb-1">Телефон</h3>
                      <a href="tel:+79136280523" className="text-rose-500 hover:text-rose-600 text-lg font-medium">
                        +7 (913) 628-05-23
                      </a>
                      <p className="text-stone-500 text-sm mt-1">Ежедневно с 09:00 до 22:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      📍
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 mb-1">Адрес</h3>
                      <p className="text-stone-700">г. Омск, ул. 5-й Армии, 14</p>
                      <p className="text-stone-500 text-sm mt-1">Самовывоз: утром 08:00–12:00, вечером 17:00–19:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      🚚
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 mb-1">Доставка</h3>
                      <p className="text-stone-700">150–350 ₽</p>
                      <p className="text-stone-500 text-sm mt-1">Яндекс.Курьер или городские сервисы</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Соцсети */}
              <div>
                <h2 className="text-2xl font-bold text-stone-800 mb-6">Мы в соцсетях</h2>
                
                <div className="space-y-4">
                  <a 
                    href="https://vk.com/straus_z" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl hover:shadow-md transition group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl flex items-center justify-center text-white text-xl">
                      💙
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 group-hover:text-blue-600 transition">ВКонтакте</h3>
                      <p className="text-stone-500 text-sm">@straus_z</p>
                    </div>
                  </a>

                  <a 
                    href="https://max.ru/u/f9LHodD0cOKXiqkASLdDRIqLxRqY1G5SjEUno28wumWVeBYGyCv4OF8dedQ" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl">
                      💬
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 group-hover:text-blue-600 transition">Max</h3>
                      <p className="text-stone-500 text-sm">@straus_z</p>
                    </div>
                  </a>

                  <a 
                    href="https://www.avito.ru/user/07aaa8313ca1d655359c40629551041f/profile" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-lime-50 rounded-xl hover:shadow-md transition group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-lime-500 rounded-xl flex items-center justify-center text-white text-xl">
                      🛒
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 group-hover:text-green-600 transition">Авито</h3>
                      <p className="text-stone-500 text-sm">Забавный Страус</p>
                    </div>
                  </a>
                </div>

                {/* О мастере */}
                <div className="mt-8 p-6 bg-rose-50 rounded-xl border border-rose-100">
                  <p className="text-stone-700 text-center">
                    <span className="text-2xl">🌿</span>
                    <br />
                    <span className="font-bold text-stone-800">Елена</span>
                    <br />
                    <span className="text-sm">Создательница «Забавного Страуса»</span>
                    <br />
                    <span className="text-sm text-stone-500">С 2018 года, более 5000 подарков 💝</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
