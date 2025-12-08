#!/usr/bin/env node

/**
 * Migration Script: Local MongoDB → MongoDB Atlas
 * 
 * Экспортирует все данные из локальной MongoDB
 * и загружает их в MongoDB Atlas
 */

import { MongoClient } from 'mongodb';
import chalk from 'chalk';

// ============================================================================
// КОНФИГ
// ============================================================================

const LOCAL_URI = 'mongodb://localhost:27017';
const ATLAS_URI = 'mongodb+srv://lilyavelis:NcNnQ2UF8ImmAvtl@mango-from-garden.9cehdvq.mongodb.net/?appName=Mango-From-Garden';
const DB_NAME = 'garden-patches';

// ============================================================================
// ФУНКЦИИ
// ============================================================================

async function migrateDatabase() {
  let localClient = null;
  let atlasClient = null;

  try {
    console.log(chalk.cyan('\n🚀 Начинаю миграцию...\n'));

    // Подключаемся к локальной БД
    console.log(chalk.yellow('📡 Подключаюсь к локальной MongoDB...'));
    localClient = new MongoClient(LOCAL_URI);
    await localClient.connect();
    const localDb = localClient.db(DB_NAME);
    console.log(chalk.green('✅ Локальная БД подключена\n'));

    // Подключаемся к Atlas
    console.log(chalk.yellow('📡 Подключаюсь к MongoDB Atlas...'));
    atlasClient = new MongoClient(ATLAS_URI);
    await atlasClient.connect();
    const atlasDb = atlasClient.db(DB_NAME);
    console.log(chalk.green('✅ Atlas подключен\n'));

    // Получаем список коллекций
    const collections = await localDb.listCollections().toArray();
    console.log(chalk.blue(`📚 Найдено коллекций: ${collections.length}\n`));

    if (collections.length === 0) {
      console.log(chalk.yellow('⚠️  Нет коллекций для миграции'));
      return;
    }

    // Мигрируем каждую коллекцию
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(chalk.cyan(`\n→ Мигрирую: ${collectionName}`));

      // Получаем все документы из локальной БД
      const localCollection = localDb.collection(collectionName);
      const documents = await localCollection.find({}).toArray();
      console.log(chalk.gray(`  Найдено документов: ${documents.length}`));

      if (documents.length === 0) {
        console.log(chalk.gray(`  (пусто, пропускаю)`));
        continue;
      }

      // Удаляем старую коллекцию в Atlas (если она есть)
      try {
        await atlasDb.collection(collectionName).deleteMany({});
        console.log(chalk.gray(`  Очищена коллекция в Atlas`));
      } catch (e) {
        // Коллекция может не существовать - это OK
      }

      // Вставляем документы в Atlas
      const atlasCollection = atlasDb.collection(collectionName);
      const result = await atlasCollection.insertMany(documents);
      console.log(chalk.green(`  ✅ Вставлено: ${result.insertedCount} документов`));
    }

    console.log(chalk.cyan('\n\n🎉 МИГРАЦИЯ ЗАВЕРШЕНА!\n'));
    console.log(chalk.blue('📊 Статистика:'));
    console.log(chalk.blue(`   Коллекций: ${collections.length}`));
    
    // Показываем статистику по коллекциям
    for (const collectionInfo of collections) {
      const count = await atlasDb.collection(collectionInfo.name).countDocuments();
      console.log(chalk.green(`   • ${collectionInfo.name}: ${count} док.`));
    }

    console.log(chalk.green('\n✨ Данные в Atlas готовы к использованию!\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ ОШИБКА:'), error.message);
    console.error(chalk.red('\nПроверьте:'));
    console.error(chalk.red('1. Локальная MongoDB запущена? (mongod --version)'));
    console.error(chalk.red('2. Connection string к Atlas правильный?'));
    console.error(chalk.red('3. IP адрес добавлен в Atlas Security?'));
    process.exit(1);
  } finally {
    // Закрываем оба соединения
    if (localClient) {
      await localClient.close();
      console.log(chalk.gray('\n(Локальное соединение закрыто)'));
    }
    if (atlasClient) {
      await atlasClient.close();
      console.log(chalk.gray('(Atlas соединение закрыто)'));
    }
  }
}

// ============================================================================
// ЗАПУСК
// ============================================================================

migrateDatabase().catch((error) => {
  console.error(chalk.red('Критическая ошибка:'), error);
  process.exit(1);
});
