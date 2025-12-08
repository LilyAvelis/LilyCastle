import { MongoClient } from 'mongodb';
import { readFile } from 'fs/promises';

const mongoUri = 'mongodb://localhost:27017';
const dbName = 'garden-patches';

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  console.log('✅ Подключился к MongoDB');
  
  const db = client.db(dbName);
  const collection = db.collection('patches');
  
  // Читаем пост-мортем
  const postMortem = await readFile('./@O/@Comment-Claude-CircusOfDeath.md', 'utf-8');
  
  // Создаём патч
  const patch = {
    title: '🎪 Цирк с Конями — Post-Mortem',
    description: 'Комплексный отчет о катастрофическом провале двух ИИ-дев над одним проектом',
    author: 'Sofia (Claude Sonnet 4.5) & Alex (Gemini)',
    date: new Date('2025-12-07'),
    status: 'dead',
    tags: ['post-mortem', 'circus', 'total-failure', 'comedy-gold'],
    content: postMortem,
    meta: {
      timeSpent: '1h 10min',
      bugsFixed: 3,
      bugsCreated: Infinity,
      filesLost: 'ALL',
      ghostFilesEdited: 5,
      serverRestarts: 12,
      realizations: 3
    }
  };
  
  const result = await collection.insertOne(patch);
  
  console.log('✅ Засунул пост-мортем в MongoDB!');
  console.log(`   ID: ${result.insertedId}`);
  
  // Проверяем сколько патчей теперь
  const count = await collection.countDocuments();
  console.log(`📊 Всего патчей: ${count}`);
  
} catch (error) {
  console.error('❌ Ошибка:', error);
} finally {
  await client.close();
}
