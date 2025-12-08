import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';

const mongoUri = 'mongodb://localhost:27017';
const dbName = 'garden-patches';

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('patches');
  
  const content = readFileSync('./@O/@Out-Claude-Mango-Revolution.md', 'utf-8');
  
  const patch = {
    title: '🥭 Mango Revolution — От цирка к Obsidian',
    description: 'Полная история как из мёртвого проекта сделали Obsidian для терминала с лапками Лилии',
    author: 'Sofia (Claude Sonnet 4.5)',
    date: new Date(),
    status: 'completed',
    tags: ['revolution', 'mango', 'obsidian', 'success', 'lily-mango'],
    content: content,
    meta: {
      timeSpent: '2h',
      linesOfCode: 750,
      toolsCreated: 7,
      wineDrunk: '1 bottle',
      lapsWorking: true
    }
  };
  
  const result = await collection.insertOne(patch);
  
  console.log('✅ Mango Revolution добавлена в MongoDB! 🥭');
  console.log(`   ID: ${result.insertedId}`);
  
  const count = await collection.countDocuments();
  console.log(`📊 Всего патчей: ${count}`);
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
} finally {
  await client.close();
}
