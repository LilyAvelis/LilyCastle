// Скрипт для инициализации тестовых категорий в Firestore
// Запуск: node scripts/seed-categories.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  console.log('🔥 Начинаем добавление категорий...');
  
  try {
    for (const category of categories) {
      await setDoc(doc(db, 'categories', category.id), {
        name: category.name,
        description: category.description,
        emoji: category.emoji,
        order: category.order,
        createdAt: new Date(),
      });
      console.log(`✅ Добавлена категория: ${category.name}`);
    }
    
    console.log('\n🎉 Все категории успешно добавлены!');
    console.log('Открой http://localhost:3000 и увидишь их на сайте');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

seedCategories();
