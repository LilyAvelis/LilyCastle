#!/usr/bin/env node
import { MongoClient } from 'mongodb';
import { readFile } from 'fs/promises';

const mongoUri = 'mongodb://localhost:27017';
const dbName = 'garden-patches';

// Парсим аргументы командной строки
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📦 Использование: node add-patch.mjs [опции]

Опции:
  --title "Заголовок"              Заголовок патча (обязательно)
  --description "Описание"         Краткое описание
  --author "Имя автора"            Автор патча
  --status "active|dead|pending"   Статус патча
  --tags "tag1,tag2,tag3"          Теги через запятую
  --content "Текст"                Прямой текст контента
  --file "path/to/file.md"         Путь к файлу с контентом
  --meta '{"key": "value"}'        JSON с метаданными

Примеры:
  node add-patch.mjs --title "Новый патч" --author "Sofia" --status active
  node add-patch.mjs --title "Bug Fix" --file "./fix.md" --tags "bugfix,urgent"
  `);
  process.exit(0);
}

// Простой парсер аргументов
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

if (!options.title) {
  console.error('❌ Заголовок обязателен! Используйте --title "Заголовок патча"');
  process.exit(1);
}

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('patches');
  
  // Формируем патч
  const patch = {
    title: options.title,
    description: options.description || '',
    author: options.author || 'Anonymous AI',
    date: new Date(),
    status: options.status || 'pending',
  };
  
  // Добавляем теги если есть
  if (options.tags) {
    patch.tags = options.tags.split(',').map(t => t.trim());
  }
  
  // Добавляем контент
  if (options.file) {
    patch.content = await readFile(options.file, 'utf-8');
  } else if (options.content) {
    patch.content = options.content;
  }
  
  // Добавляем мета если есть
  if (options.meta) {
    patch.meta = JSON.parse(options.meta);
  }
  
  const result = await collection.insertOne(patch);
  
  console.log('✅ Патч добавлен!');
  console.log(`   ID: ${result.insertedId}`);
  console.log(`   Заголовок: ${patch.title}`);
  console.log(`   Автор: ${patch.author}`);
  console.log(`   Статус: ${patch.status}`);
  
  const count = await collection.countDocuments();
  console.log(`\n📊 Всего патчей в базе: ${count}`);
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  await client.close();
}
