// Скрипт с Firebase Admin SDK (работает через REST API, обходит DNS блокировки)
// Запуск: node scripts/seed-admin.js

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Admin SDK инициализируется без serviceAccount для эмулятора или с Application Default Credentials
admin.initializeApp({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

const categories = [
  {
    id: 'клубника',
    name: 'Клубничные букеты',
    description: 'Сочная клубника в сочетании с нежными цветами',
    emoji: '🍓',
    order: 1,
  },
  {
    id: 'шоколад',
    name: 'Шоколадные композиции',
    description: 'Клубника в бельгийском шоколаде с декором',
    emoji: '🍫',
    order: 2,
  },
  {
    id: 'экзот',
    name: 'Экзотические букеты',
    description: 'Манго, ананас, маракуйя и другие фрукты',
    emoji: '🥭',
    order: 3,
  },
  {
    id: 'ягоды',
    name: 'Ягодные композиции',
    description: 'Малина, ежевика, смородина и черника',
    emoji: '🫐',
    order: 4,
  },
  {
    id: 'премиум',
    name: 'Премиум коллекция',
    description: 'Эксклюзивные букеты с редкими ингредиентами',
    emoji: '✨',
    order: 5,
  },
];

async function seedCategories() {
  console.log('🔥 Используем Admin SDK для обхода блокировок...');
  
  try {
    const batch = db.batch();
    
    for (const category of categories) {
      const ref = db.collection('categories').doc(category.id);
      batch.set(ref, {
        name: category.name,
        description: category.description,
        emoji: category.emoji,
        order: category.order,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ Подготовлена категория: ${category.name}`);
    }
    
    await batch.commit();
    console.log('\n🎉 Все категории успешно добавлены через Admin SDK!');
    console.log('Открой http://localhost:3000 и увидишь их на сайте');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('Детали:', error);
    process.exit(1);
  }
}

seedCategories();
