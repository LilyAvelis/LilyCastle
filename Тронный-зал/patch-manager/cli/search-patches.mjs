#!/usr/bin/env node
import { MongoClient } from 'mongodb';

const mongoUri = 'mongodb://localhost:27017';
const dbName = 'garden-patches';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🔍 Использование: node search-patches.mjs [опции]

Опции:
  --title "текст"        Поиск по заголовку
  --author "имя"         Поиск по автору
  --status "статус"      Фильтр по статусу
  --tag "тег"            Поиск по тегу
  --content "текст"      Поиск в контенте

Примеры:
  node search-patches.mjs --author Sofia
  node search-patches.mjs --status dead
  node search-patches.mjs --tag circus
  node search-patches.mjs --title "Цирк"
  `);
  process.exit(0);
}

// Парсим аргументы
const options = {};
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const key = arg.slice(2);
    const value = args[i + 1];
    options[key] = value;
    i++;
  }
}

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('patches');
  
  // Строим запрос
  const query = {};
  
  if (options.title) {
    query.title = { $regex: options.title, $options: 'i' };
  }
  
  if (options.author) {
    query.author = { $regex: options.author, $options: 'i' };
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.tag) {
    query.tags = options.tag;
  }
  
  if (options.content) {
    query.content = { $regex: options.content, $options: 'i' };
  }
  
  const patches = await collection.find(query).sort({ date: -1 }).toArray();
  
  console.log(`\n🔍 Найдено патчей: ${patches.length}\n`);
  
  if (patches.length === 0) {
    console.log('Ничего не найдено ⚰️\n');
    process.exit(0);
  }
  
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
