#!/usr/bin/env node
import { MongoClient } from 'mongodb';

const mongoUri = 'mongodb://localhost:27017';
const dbName = 'garden-patches';

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('patches');
  
  const patches = await collection.find({}).sort({ date: -1 }).toArray();
  
  console.log(`\n📦 Всего патчей: ${patches.length}\n`);
  
  patches.forEach((patch, idx) => {
    console.log(`${idx + 1}. [${patch.status || 'unknown'}] ${patch.title}`);
    console.log(`   Автор: ${patch.author || 'Unknown'}`);
    console.log(`   Дата: ${patch.date ? new Date(patch.date).toLocaleDateString('ru-RU') : 'N/A'}`);
    if (patch.tags && patch.tags.length > 0) {
      console.log(`   Теги: ${patch.tags.join(', ')}`);
    }
    console.log(`   ID: ${patch._id}`);
    console.log('');
  });
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  await client.close();
}
