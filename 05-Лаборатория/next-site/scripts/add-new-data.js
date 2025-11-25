// Скрипт для добавления НОВОЙ категории и товаров для проверки реактивности
// Запуск: node scripts/add-new-data.js

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// 1. Новая категория
const newCategory = { 
  id: 'combo', 
  name: 'Комбо-наборы', 
  description: 'Идеальное сочетание цветов и сладостей', 
  emoji: '🎁', 
  order: 6 
};

// 2. Новые товары для этой категории
const newProducts = [
  {
    id: 'combo-love',
    categoryId: 'combo',
    name: 'Love is...',
    description: 'Букет из 15 роз + коробка клубники в шоколаде',
    price: 5500,
    imageUrl: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=800',
    inStock: true,
    order: 1
  },
  {
    id: 'combo-party',
    categoryId: 'combo',
    name: 'Сладкая Вечеринка',
    description: 'Большой набор ягод, фруктов и макарун для компании',
    price: 7990,
    imageUrl: 'https://images.unsplash.com/photo-1563729768-6af7c46d66c1?w=800',
    inStock: true,
    order: 2
  }
];

async function addNewData() {
  console.log('🔥 Добавляем новые данные для проверки реактивности...\n');

  // 1. Пушим категорию
  const catUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/lily-base/documents/categories/${newCategory.id}?key=${API_KEY}`;
  const catBody = {
    fields: {
      name: { stringValue: newCategory.name },
      description: { stringValue: newCategory.description },
      emoji: { stringValue: newCategory.emoji },
      order: { integerValue: newCategory.order },
      createdAt: { timestampValue: new Date().toISOString() }
    }
  };

  try {
    const response = await fetch(catUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catBody),
    });
    if (response.ok) console.log(`✅ Категория добавлена: ${newCategory.name}`);
    else console.error(`❌ Ошибка категории: ${await response.text()}`);
  } catch (e) { console.error(e); }

  // 2. Пушим товары
  for (const prod of newProducts) {
    const prodUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/lily-base/documents/products/${prod.id}?key=${API_KEY}`;
    const prodBody = {
      fields: {
        categoryId: { stringValue: prod.categoryId },
        name: { stringValue: prod.name },
        description: { stringValue: prod.description },
        price: { integerValue: prod.price },
        imageUrl: { stringValue: prod.imageUrl },
        inStock: { booleanValue: prod.inStock },
        order: { integerValue: prod.order },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    };

    try {
      const response = await fetch(prodUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodBody),
      });
      if (response.ok) console.log(`✅ Товар добавлен: ${prod.name}`);
      else console.error(`❌ Ошибка товара: ${await response.text()}`);
    } catch (e) { console.error(e); }
  }

  console.log('\n🎉 Данные отправлены! Смотри на сайт - должно появиться само.');
}

addNewData();
