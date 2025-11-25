const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'lily-base');

async function clearBadImages() {
  console.log('🧹 Clearing bad image URLs...');
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);

  if (snapshot.empty) {
    console.log('❌ No products found.');
    return;
  }

  let fixedCount = 0;

  for (const docSnap of snapshot.docs) {
    const id = docSnap.id;
    // Очищаем URL, чтобы не было 404 ошибок и бесконечной загрузки
    // Теперь пользователь сможет загрузить свои фото через админку
    await updateDoc(doc(db, 'products', id), {
      imageUrl: ''
    });
    fixedCount++;
  }

  console.log(`\n✅ Done. Cleared images for ${fixedCount} products. Now they will show emojis until you upload photos.`);
}

clearBadImages().catch(console.error);
