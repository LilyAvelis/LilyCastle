// Обнуляем imageUrl для всех товаров (плейсхолдеры)
// Запуск: node scripts/update-images-null.js

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const productIds = [
  'strawberry-classic', 'strawberry-deluxe', 'strawberry-romance', 'strawberry-mini',
  'chocolate-strawberry', 'chocolate-white', 'chocolate-mix', 'chocolate-luxury',
  'exotic-tropical', 'exotic-dragon', 'exotic-passion', 'exotic-paradise',
  'berry-forest', 'berry-garden', 'berry-premium', 'berry-chocolate',
  'premium-gold', 'premium-imperial', 'premium-royal', 'premium-diamond'
];

async function updateImages() {
  console.log('🖼️ Обнуляем imageUrl для плейсхолдеров...\n');

  for (const id of productIds) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/lily-base/documents/products/${id}?key=${API_KEY}&updateMask.fieldPaths=imageUrl`;
    
    const body = {
      fields: {
        imageUrl: { stringValue: '' }
      }
    };

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log(`✅ ${id}`);
      } else {
        const error = await response.text();
        console.error(`❌ ${id}: ${error}`);
      }
    } catch (error) {
      console.error(`❌ ${id}: ${error.message}`);
    }
  }

  console.log('\n✨ Готово! Теперь будут градиентные плейсхолдеры с эмодзи');
}

updateImages();
