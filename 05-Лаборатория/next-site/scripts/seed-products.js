// Пуш товаров через Firestore REST API
// Запуск: node scripts/seed-products.js

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const products = [
  // Клубничные букеты
  {
    id: 'strawberry-classic',
    categoryId: 'клубника',
    name: 'Клубничная классика',
    description: 'Сочная клубника с белыми розами',
    price: 2990,
    imageUrl: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=800',
    inStock: true,
    order: 1
  },
  {
    id: 'strawberry-deluxe',
    categoryId: 'клубника',
    name: 'Клубничный делюкс',
    description: 'Премиум клубника с пионами',
    price: 4990,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    inStock: true,
    order: 2
  },
  {
    id: 'strawberry-romance',
    categoryId: 'клубника',
    name: 'Клубничный романс',
    description: 'Клубника в коробке с эвкалиптом',
    price: 3490,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
    inStock: true,
    order: 3
  },
  {
    id: 'strawberry-mini',
    categoryId: 'клубника',
    name: 'Мини букет',
    description: 'Компактный букет для комплимента',
    price: 1990,
    imageUrl: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800',
    inStock: true,
    order: 4
  },

  // Шоколадные композиции
  {
    id: 'chocolate-strawberry',
    categoryId: 'шоколад',
    name: 'Шоколадный соблазн',
    description: 'Клубника в бельгийском шоколаде',
    price: 3990,
    imageUrl: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=800',
    inStock: true,
    order: 1
  },
  {
    id: 'chocolate-white',
    categoryId: 'шоколад',
    name: 'Белый шоколад',
    description: 'Клубника в белом шоколаде с золотом',
    price: 4490,
    imageUrl: 'https://images.unsplash.com/photo-1548848571-99a5b5e8b4d7?w=800',
    inStock: true,
    order: 2
  },
  {
    id: 'chocolate-mix',
    categoryId: 'шоколад',
    name: 'Шоколадный микс',
    description: 'Ассорти из темного и белого шоколада',
    price: 4990,
    imageUrl: 'https://images.unsplash.com/photo-1511911063855-2bf39afa5b2d?w=800',
    inStock: true,
    order: 3
  },
  {
    id: 'chocolate-luxury',
    categoryId: 'шоколад',
    name: 'Шоколадная роскошь',
    description: 'Клубника в шоколаде с золотыми лепестками',
    price: 5990,
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
    inStock: true,
    order: 4
  },

  // Экзотические букеты
  {
    id: 'exotic-tropical',
    categoryId: 'экзот',
    name: 'Тропический рай',
    description: 'Манго, ананас, маракуйя',
    price: 4990,
    imageUrl: 'https://images.unsplash.com/photo-1519624213730-2c33251b6c5b?w=800',
    inStock: true,
    order: 1
  },
  {
    id: 'exotic-dragon',
    categoryId: 'экзот',
    name: 'Драконий фрукт',
    description: 'Питайя с киви и карамболой',
    price: 5490,
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800',
    inStock: true,
    order: 2
  },
  {
    id: 'exotic-passion',
    categoryId: 'экзот',
    name: 'Страсть к экзотике',
    description: 'Маракуйя, личи, рамбутан',
    price: 6490,
    imageUrl: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800',
    inStock: true,
    order: 3
  },
  {
    id: 'exotic-paradise',
    categoryId: 'экзот',
    name: 'Райский букет',
    description: 'Ассорти экзотических фруктов',
    price: 7990,
    imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800',
    inStock: true,
    order: 4
  },

  // Ягодные композиции
  {
    id: 'berry-forest',
    categoryId: 'ягоды',
    name: 'Лесные ягоды',
    description: 'Малина, ежевика, черника',
    price: 3490,
    imageUrl: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800',
    inStock: true,
    order: 1
  },
  {
    id: 'berry-garden',
    categoryId: 'ягоды',
    name: 'Садовый микс',
    description: 'Клубника, малина, смородина',
    price: 3990,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    inStock: true,
    order: 2
  },
  {
    id: 'berry-premium',
    categoryId: 'ягоды',
    name: 'Ягодный премиум',
    description: 'Отборные ягоды с декором',
    price: 4990,
    imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800',
    inStock: true,
    order: 3
  },
  {
    id: 'berry-chocolate',
    categoryId: 'ягоды',
    name: 'Ягоды в шоколаде',
    description: 'Микс ягод в бельгийском шоколаде',
    price: 5490,
    imageUrl: 'https://images.unsplash.com/photo-1511911063855-2bf39afa5b2d?w=800',
    inStock: true,
    order: 4
  },

  // Премиум коллекция
  {
    id: 'premium-gold',
    categoryId: 'премиум',
    name: 'Золотая композиция',
    description: 'Эксклюзивный букет с съедобным золотом',
    price: 9990,
    imageUrl: 'https://images.unsplash.com/photo-1519181245277-cffeb31da2e3?w=800',
    inStock: true,
    order: 1
  },
  {
    id: 'premium-imperial',
    categoryId: 'премиум',
    name: 'Императорский',
    description: 'Редкие фрукты с цветами орхидеи',
    price: 12990,
    imageUrl: 'https://images.unsplash.com/photo-1518534881834-5edc9a2b3f5e?w=800',
    inStock: true,
    order: 2
  },
  {
    id: 'premium-royal',
    categoryId: 'премиум',
    name: 'Королевский',
    description: 'Клубника с шампанским и розами',
    price: 14990,
    imageUrl: 'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=800',
    inStock: true,
    order: 3
  },
  {
    id: 'premium-diamond',
    categoryId: 'премиум',
    name: 'Бриллиантовый',
    description: 'Топ-композиция с трюфелями',
    price: 19990,
    imageUrl: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=800',
    inStock: true,
    order: 4
  },
];

async function seedProducts() {
  console.log('🍓 Пушим товары через REST API...\n');

  for (const product of products) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/lily-base/documents/products/${product.id}?key=${API_KEY}`;
    
    const body = {
      fields: {
        categoryId: { stringValue: product.categoryId },
        name: { stringValue: product.name },
        description: { stringValue: product.description },
        price: { integerValue: product.price },
        imageUrl: { stringValue: product.imageUrl },
        inStock: { booleanValue: product.inStock },
        order: { integerValue: product.order },
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
        console.log(`✅ ${product.name} (${product.categoryId})`);
      } else {
        const error = await response.text();
        console.error(`❌ ${product.name}: ${error}`);
      }
    } catch (error) {
      console.error(`❌ ${product.name}: ${error.message}`);
    }
  }

  console.log('\n✨ Готово! Товары запушены в lily-base');
}

seedProducts();
