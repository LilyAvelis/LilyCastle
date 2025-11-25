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

async function checkAndFixProducts() {
  console.log('🔍 Checking products in DB...');
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);

  if (snapshot.empty) {
    console.log('❌ No products found.');
    return;
  }

  let fixedCount = 0;
  let totalCount = 0;

  for (const docSnap of snapshot.docs) {
    totalCount++;
    const data = docSnap.data();
    const id = docSnap.id;
    
    console.log(`📦 Product [${id}]: ${data.name}`);
    console.log(`   - Image URL: ${data.imageUrl ? `'${data.imageUrl}'` : 'MISSING/UNDEFINED'}`);

    // Если поля imageUrl нет вообще или оно undefined, добавим его как пустую строку
    if (data.imageUrl === undefined) {
      console.log(`   ⚠️ Fixing missing imageUrl field...`);
      await updateDoc(doc(db, 'products', id), {
        imageUrl: ''
      });
      fixedCount++;
    }
  }

  console.log(`\n✅ Done. Checked ${totalCount} products. Fixed ${fixedCount} missing image fields.`);
}

checkAndFixProducts().catch(console.error);
