import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');

try {
  await client.connect();
  const db = client.db('garden-patches');
  const collection = db.collection('patches');
  
  console.log('📋 Индексы в коллекции:');
  const indexes = await collection.indexes();
  console.log(JSON.stringify(indexes, null, 2));
  
  // Удаляем проблемный индекс
  try {
    await collection.dropIndex('project_1_patch_id_1');
    console.log('\n✅ Удалил проблемный индекс project_1_patch_id_1');
  } catch (e) {
    console.log('\n⚠️  Индекс не найден или уже удалён');
  }
  
} finally {
  await client.close();
}
