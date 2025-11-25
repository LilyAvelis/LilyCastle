# Firebase Setup Guide

## 1. Создай Firebase проект

1. Открой https://console.firebase.google.com
2. Нажми **"Add project"** или **"Создать проект"**
3. Введи имя проекта (например: `sweetbouquet-prod`)
4. Отключи Google Analytics (не нужен для MVP)
5. Нажми **"Create project"**

## 2. Настрой Firestore Database

1. В левом меню выбери **"Firestore Database"**
2. Нажми **"Create database"**
3. Выбери **"Start in test mode"** (для разработки)
4. Выбери регион: **europe-west** (ближайший к России)
5. Нажми **"Enable"**

## 3. Настрой Firebase Storage

1. В левом меню выбери **"Storage"**
2. Нажми **"Get started"**
3. Выбери **"Start in test mode"**
4. Нажми **"Next"** → **"Done"**

## 4. Получи конфиг для веб-приложения

1. В Project Overview нажми на иконку **</> Web**
2. Введи App nickname: `sweetbouquet-web`
3. **НЕ** ставь галочку "Firebase Hosting"
4. Нажми **"Register app"**
5. Скопируй `firebaseConfig` объект
6. Нажми **"Continue to console"**

## 5. Создай `.env.local` файл

Создай файл `.env.local` в корне проекта и вставь свои данные:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=твой-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=твой-проект.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=твой-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=твой-проект.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=твой-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=твой-app-id
```

## 6. Создай коллекции в Firestore

### Коллекция `categories`

Пример документа:

```json
{
  "name": "Клубничные букеты",
  "description": "Сочная клубника в сочетании с нежными цветами",
  "emoji": "🍓",
  "order": 1
}
```

**Создай вручную:**

1. Открой Firestore
2. Нажми **"Start collection"**
3. Collection ID: `categories`
4. Document ID: `клубника` (или auto-ID)
5. Добавь поля выше
6. Повтори для других категорий: шоколад 🍫, экзот 🥭, премиум ✨, ягоды 🫐

### Коллекция `products`

Пример документа:

```json
{
  "title": "Розовый рай",
  "description": "Букет из клубники и роз",
  "price": 2500,
  "categoryId": "клубника",
  "images": ["https://example.com/photo1.jpg"],
  "featured": true,
  "createdAt": "2024-11-24T00:00:00Z"
}
```

## 7. Загрузи фото в Storage

1. Открой **Storage** в Firebase Console
2. Создай папку `products/`
3. Загрузи фото товаров
4. Скопируй публичные URL
5. Вставь URL в поле `images` в Firestore

## 8. Перезапусти dev сервер

```bash
npm run dev
```

## 9. Проверь результат

Открой http://localhost:3000 - категории должны загрузиться из Firebase!

## Security Rules (для продакшена)

Когда будешь деплоить, обнови Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Читать могут все
    match /categories/{document=**} {
      allow read: if true;
    }
    match /products/{document=**} {
      allow read: if true;
    }
    // Писать только админы (настроишь позже)
    match /{document=**} {
      allow write: if false;
    }
  }
}
```
