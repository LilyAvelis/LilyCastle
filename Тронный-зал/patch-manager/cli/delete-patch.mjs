#!/usr/bin/env node
import { MongoClient, ObjectId } from 'mongodb';

const mongoUri = 'mongodb://localhost:27017';
const dbName = 'garden-patches';

const patchId = process.argv[2];

if (!patchId) {
  console.error('❌ Использование: node delete-patch.mjs <patch-id>');
  console.error('   Пример: node delete-patch.mjs 6935796c2234090900b4f5af');
  process.exit(1);
}

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('patches');
  
  // Сначала получаем патч для показа
  const patch = await collection.findOne({ _id: new ObjectId(patchId) });
  
  if (!patch) {
    console.error(`❌ Патч с ID ${patchId} не найден`);
    process.exit(1);
  }
  
  console.log(`\n🗑️  Удаляю патч:`);
  console.log(`   ${patch.title}`);
  console.log(`   Автор: ${patch.author || 'Unknown'}`);
  
  const result = await collection.deleteOne({ _id: new ObjectId(patchId) });
  
  if (result.deletedCount === 1) {
    console.log(`\n✅ Патч удалён!`);
    
    const count = await collection.countDocuments();
    console.log(`📊 Осталось патчей: ${count}\n`);
  } else {
    console.error(`❌ Не удалось удалить патч`);
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  await client.close();
}
