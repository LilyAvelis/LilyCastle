// Прямой пуш через Firestore REST API (обходит все блокировки)
// Запуск: node scripts/seed-rest.js

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const categories = [
  { id: 'клубника', name: 'Клубничные букеты', description: 'Сочная клубника в сочетании с нежными цветами', emoji: '🍓', order: 1 },
  { id: 'шоколад', name: 'Шоколадные композиции', description: 'Клубника в бельгийском шоколаде с декором', emoji: '🍫', order: 2 },
  { id: 'экзот', name: 'Экзотические букеты', description: 'Манго, ананас, маракуйя и другие фрукты', emoji: '🥭', order: 3 },
  { id: 'ягоды', name: 'Ягодные композиции', description: 'Малина, ежевика, смородина и черника', emoji: '🫐', order: 4 },
  { id: 'премиум', name: 'Премиум коллекция', description: 'Эксклюзивные букеты с редкими ингредиентами', emoji: '✨', order: 5 },
];

async function seedWithREST() {
  console.log('🔥 Пушим через REST API (обход всех блокировок)...\n');

  for (const cat of categories) {
    // Используем lily-base вместо (default)
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/lily-base/documents/categories/${cat.id}?key=${API_KEY}`;
    
    const body = {
      fields: {
        name: { stringValue: cat.name },
        description: { stringValue: cat.description },
        emoji: { stringValue: cat.emoji },
        order: { integerValue: cat.order },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    };

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log(`✅ ${cat.name}`);
      } else {
        const error = await response.text();
        console.error(`❌ ${cat.name}: ${error}`);
      }
    } catch (error) {
      console.error(`❌ ${cat.name}: ${error.message}`);
    }
  }

  console.log('\n🎉 Готово! Обнови http://localhost:3000');
}

seedWithREST();
