import { createSignal } from 'solid-js';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = createSignal('home');
  const [hoveredCard, setHoveredCard] = createSignal(null);

  const frameworks = [
    { id: 'trout', name: 'Форель', emoji: '🐟', title: 'Next.js', color: '#000000', bgGradient: 'from-gray-900 to-slate-700' },
    { id: 'mackerel', name: 'Скумбрия', emoji: '🌊', title: 'Nuxt', color: '#00dc82', bgGradient: 'from-emerald-600 to-teal-600' },
    { id: 'shark', name: 'Акула', emoji: '🦈', title: 'Angular', color: '#dd0031', bgGradient: 'from-red-600 to-rose-600' },
    { id: 'smelt', name: 'Корюшка', emoji: '✨', title: 'Astro', color: '#ff5a03', bgGradient: 'from-orange-500 to-amber-600' },
  ];
  
  const getBackgroundStyle = () => {
    const page = currentPage();
    if (page === 'home') return 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    const fw = frameworks.find(f => f.id === page);
    return fw ? `background: linear-gradient(135deg, ${fw.color} 0%, ${adjustColor(fw.color, -30)} 100%)` : '';
  };
  
  const adjustColor = (hex, percent) => {
    const R = parseInt(hex.substring(1, 3), 16) + percent;
    const G = parseInt(hex.substring(3, 5), 16) + percent;
    const B = parseInt(hex.substring(5, 7), 16) + percent;
    return `rgb(${Math.max(0, R)}, ${Math.max(0, G)}, ${Math.max(0, B)})`;
  };

  return (
    <div class="app" style={getBackgroundStyle()}>
      <nav class="navbar">
        <h1>🐠 Аквариум SolidJS</h1>
        <button 
          onClick={() => setCurrentPage('home')}
          class={currentPage() === 'home' ? 'nav-btn active' : 'nav-btn'}
        >
          ← Главная
        </button>
      </nav>

      <main class="container">
        {currentPage() === 'home' && (
          <div class="home fade-in">
            <h2>Добро пожаловать в Аквариум!</h2>
            <p>Выбери рыбу (фреймворк) чтобы узнать о ней</p>
            
            <div class="cards-grid">
              {frameworks.map(fw => (
                <div 
                  class={`card scale-transition ${hoveredCard() === fw.id ? 'card-hovered' : ''}`}
                  onClick={() => setCurrentPage(fw.id)}
                  onMouseEnter={() => setHoveredCard(fw.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ 'border-color': fw.color }}
                >
                  <div class="emoji-bounce">{fw.emoji}</div>
                  <h3>{fw.name}</h3>
                  <p class="subtitle">{fw.title}</p>
                  <div class="click-hint">→ Кликни</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {frameworks.map(fw => (
          currentPage() === fw.id && (
            <div class="room fade-in" style={{ 'animation': 'fadeInScale 0.4s ease-out' }}>
              <button 
                onClick={() => setCurrentPage('home')}
                class="back-btn"
              >
                ← Назад в аквариум
              </button>
              
              <div class="room-header" style={{ 'background-color': fw.color }}>
                <div class="emoji-spin">{fw.emoji}</div>
                <h2>{fw.name}</h2>
                <p class="subtitle">{fw.title}</p>
              </div>

              <div class="room-content slide-up">
                {fw.id === 'trout' && (
                  <div>
                    <h3>🐟 Next.js — Форель</h3>
                    <p><strong>React-based</strong> фреймворк с SSR/SSG — король производительности.</p>
                    <div class="features">
                      <div class="feature-item">✅ Отличен для больших приложений</div>
                      <div class="feature-item">✅ Гибкая архитектура, много инструментов</div>
                      <div class="feature-item">✅ Turbopack — быстрейшая компиляция</div>
                      <div class="feature-item warning">⚠️ Требует локальные node_modules</div>
                      <div class="feature-item warning">⚠️ Турбопак не любит симлинки</div>
                    </div>
                    <div class="tier-badge tier-high">High Tier — Enterprise</div>
                    <p class="recommendation"><strong>Когда использовать:</strong> Для enterprise приложений, сложной логики, большая команда разработчиков</p>
                  </div>
                )}
                
                {fw.id === 'mackerel' && (
                  <div>
                    <h3>🌊 Nuxt — Скумбрия</h3>
                    <p><strong>Vue-based</strong> фреймворк с SSR/SSG — удобный и мощный.</p>
                    <div class="features">
                      <div class="feature-item">✅ Удобный и интуитивный синтаксис</div>
                      <div class="feature-item">✅ Отличные dev tools (Vue DevTools)</div>
                      <div class="feature-item">✅ Работает отлично с симлинками</div>
                      <div class="feature-item">✅ Быстрая разработка</div>
                    </div>
                    <div class="tier-badge tier-mid">Mid Tier — Recommended</div>
                    <p class="recommendation"><strong>Когда использовать:</strong> Для средних проектов, быстрой разработки, если нравится Vue</p>
                  </div>
                )}

                {fw.id === 'shark' && (
                  <div>
                    <h3>🦈 Angular — Акула</h3>
                    <p><strong>Enterprise</strong> фреймворк с TypeScript и RxJS — строгий и мощный.</p>
                    <div class="features">
                      <div class="feature-item">✅ Строгая архитектура, структурированность</div>
                      <div class="feature-item">✅ Идеален для больших команд</div>
                      <div class="feature-item">✅ Dependency Injection из коробки</div>
                      <div class="feature-item">✅ Полнофункциональный фреймворк</div>
                      <div class="feature-item warning">⚠️ Требует прав админа для симлинков</div>
                      <div class="feature-item warning">⚠️ Кривая обучения выше</div>
                    </div>
                    <div class="tier-badge tier-high">High Tier — Enterprise</div>
                    <p class="recommendation"><strong>Когда использовать:</strong> Для корпоративных приложений, требуется строгая архитектура</p>
                  </div>
                )}

                {fw.id === 'smelt' && (
                  <div>
                    <h3>✨ Astro — Корюшка</h3>
                    <p><strong>Мульти-фреймворк</strong> для статических сайтов с "островами" — SEO чемпион.</p>
                    <div class="features">
                      <div class="feature-item">✅ Идеален для SEO и статических сайтов</div>
                      <div class="feature-item">✅ Быстрый и легкий (нулевой JS по умолчанию)</div>
                      <div class="feature-item">✅ Работает отлично с симлинками</div>
                      <div class="feature-item">✅ Можешь использовать React, Vue, Svelte компоненты</div>
                      <div class="feature-item">✅ Отличный для документации и блогов</div>
                    </div>
                    <div class="tier-badge tier-low">Low/Mid Tier — Perfect for Static</div>
                    <p class="recommendation"><strong>Когда использовать:</strong> Для статических сайтов, блогов, документации, простых лендингов</p>
                  </div>
                )}
              </div>
            </div>
          )
        ))}
      </main>
    </div>
  );
}

export default App;