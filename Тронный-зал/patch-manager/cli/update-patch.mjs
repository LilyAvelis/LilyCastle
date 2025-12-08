#!/usr/bin/env node
import { MongoClient, ObjectId } from 'mongodb';

const mongoUri = 'mongodb://localhost:27017';
const dbName = 'garden-patches';

const args = process.argv.slice(2);

if (args.length === 0 || !args[0] || args[0].startsWith('--')) {
  console.log(`
🔧 Использование: node update-patch.mjs <patch-id> [опции]

Опции:
  --title "Новый заголовок"        Обновить заголовок
  --description "Описание"         Обновить описание
  --author "Имя"                   Обновить автора
  --status "active|dead|pending"   Обновить статус
  --tags "tag1,tag2"               Обновить теги
  --content "Текст"                Обновить контент
  --add-meta '{"key": "value"}'    Добавить метаданные

Примеры:
  node update-patch.mjs 693579... --status active
  node update-patch.mjs 693579... --title "Новый заголовок" --tags "updated,fixed"
  `);
  process.exit(0);
}

const patchId = args[0];

// Парсим опции
const options = {};
for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const key = arg.slice(2);
    const value = args[i + 1];
    options[key] = value;
    i++;
  }
}

if (Object.keys(options).length === 0) {
  console.error('❌ Укажите хотя бы одну опцию для обновления');
  process.exit(1);
}

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('patches');
  
  // Проверяем что патч существует
  const patch = await collection.findOne({ _id: new ObjectId(patchId) });
  
  if (!patch) {
    console.error(`❌ Патч с ID ${patchId} не найден`);
    process.exit(1);
  }
  
  console.log(`\n🔧 Обновляю патч: ${patch.title}\n`);
  
  // Формируем обновление
  const update = {};
  
  if (options.title) update.title = options.title;
  if (options.description) update.description = options.description;
  if (options.author) update.author = options.author;
  if (options.status) update.status = options.status;
  if (options.content) update.content = options.content;
  if (options.tags) update.tags = options.tags.split(',').map(t => t.trim());
  
  // Добавляем мета данные
  if (options['add-meta']) {
    const newMeta = JSON.parse(options['add-meta']);
    update.meta = { ...patch.meta, ...newMeta };
  }
  
  const result = await collection.updateOne(
    { _id: new ObjectId(patchId) },
    { $set: update }
  );
  
  if (result.modifiedCount === 1) {
    console.log('✅ Патч обновлён!');
    console.log('\nОбновлённые поля:');
    Object.entries(update).forEach(([key, value]) => {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
      console.log(`   ${key}: ${displayValue}`);
    });
    console.log('');
  } else {
    console.log('⚠️  Нечего обновлять (значения не изменились)');
  }
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  await client.close();
}
