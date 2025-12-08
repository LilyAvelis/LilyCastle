#!/usr/bin/env node
import { MongoClient } from 'mongodb';
import inquirer from 'inquirer';
import { exec } from 'child_process';

const mongoUri = 'mongodb://localhost:27017';
const dbName = 'garden-patches';

console.log(`
╔═══════════════════════════════════════════════════════════╗
║ 🥭 Lily-Mango — Obsidian для лапок Лилии 🗿               ║
╚═══════════════════════════════════════════════════════════╝
`);

async function main() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('patches');
    
    while (true) {
      // Получаем патчи
      const patches = await collection.find({}).sort({ date: -1 }).toArray();
      
      console.log(`\n📦 Всего патчей: ${patches.length}\n`);
      
      // Формируем список для выбора
      const choices = patches.map((p, idx) => ({
        name: `${getStatusEmoji(p.status)} ${p.title || 'Без заголовка'} — ${p.author || 'Unknown'}`,
        value: p._id.toString(),
        short: p.title || 'Без заголовка'
      }));
      
      choices.push(
        new inquirer.Separator(),
        { name: '🔍 Поиск по тегу', value: '__search__' },
        { name: '➕ Добавить новый патч', value: '__add__' },
        { name: '🚪 Выход', value: '__exit__' }
      );
      
      // Показываем меню
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Что открыть?',
          choices: choices,
          pageSize: 15
        }
      ]);
      
      if (answer.action === '__exit__') {
        console.log('\n👋 Пока, Лилия! 🥭\n');
        break;
      }
      
      if (answer.action === '__search__') {
        await searchMode(collection);
        continue;
      }
      
      if (answer.action === '__add__') {
        console.log('\n➕ Используй: node cli/add-patch.mjs --title "..." --author "Lily"\n');
        continue;
      }
      
      // Открываем выбранный патч
      const patchId = answer.action;
      
      const viewAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'mode',
          message: 'Как посмотреть?',
          choices: [
            { name: '🌐 Открыть в браузере (красиво!) 🗿', value: 'browser' },
            { name: '📄 Показать в терминале', value: 'terminal' },
            { name: '💾 Сохранить в файл', value: 'file' },
            { name: '⬅️  Назад', value: 'back' }
          ]
        }
      ]);
      
      if (viewAnswer.mode === 'back') {
        continue;
      }
      
      // Запускаем view-patch с нужным флагом
      const flag = viewAnswer.mode === 'browser' ? '--browser' : 
                   viewAnswer.mode === 'file' ? '--file' : '';
      
      console.log(`\n⏳ Открываю патч...\n`);
      
      await new Promise((resolve) => {
        exec(`node cli/view-patch.mjs ${patchId} ${flag}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Ошибка: ${error.message}`);
          } else {
            console.log(stdout);
          }
          resolve();
        });
      });
      
      if (viewAnswer.mode !== 'browser') {
        // Пауза перед возвратом в меню
        await inquirer.prompt([
          {
            type: 'input',
            name: 'continue',
            message: 'Нажми Enter чтобы вернуться в меню...'
          }
        ]);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await client.close();
  }
}

async function searchMode(collection) {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'tag',
      message: '🔍 Введи тег для поиска:'
    }
  ]);
  
  if (!answer.tag) return;
  
  const patches = await collection.find({ tags: answer.tag }).toArray();
  
  if (patches.length === 0) {
    console.log(`\n❌ Патчи с тегом "${answer.tag}" не найдены\n`);
    return;
  }
  
  console.log(`\n✅ Найдено патчей: ${patches.length}\n`);
  
  patches.forEach((p, idx) => {
    console.log(`${idx + 1}. ${getStatusEmoji(p.status)} ${p.title}`);
    console.log(`   ID: ${p._id}`);
  });
  
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: '\nНажми Enter чтобы продолжить...'
    }
  ]);
}

function getStatusEmoji(status) {
  switch (status) {
    case 'dead': return '🪦';
    case 'active': return '🔥';
    case 'pending': return '⏳';
    case 'completed': return '✅';
    default: return '📦';
  }
}

main();
