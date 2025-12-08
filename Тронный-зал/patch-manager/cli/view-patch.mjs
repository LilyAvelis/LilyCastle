#!/usr/bin/env node
import { MongoClient, ObjectId } from 'mongodb';
import { writeFileSync } from 'fs';
import { exec } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';

// Фикс для PowerShell кодировки
process.stdout.setDefaultEncoding?.('utf8');

const mongoUri = 'mongodb://localhost:27017';
const dbName = 'garden-patches';

const patchId = process.argv[2];
const outputToFile = process.argv.includes('--file');
const openInBrowser = process.argv.includes('--browser');

if (!patchId || patchId.startsWith('--')) {
  console.error('❌ Использование: node view-patch.mjs <patch-id> [опции]');
  console.error('   Пример: node view-patch.mjs 6935796c2234090900b4f5af');
  console.error('   Опции:');
  console.error('     --file      Сохранить в текстовый файл');
  console.error('     --browser   Открыть в браузере (красиво!) 🗿');
  process.exit(1);
}

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('patches');
  
  const patch = await collection.findOne({ _id: new ObjectId(patchId) });
  
  if (!patch) {
    console.error(`❌ Патч с ID ${patchId} не найден`);
    process.exit(1);
  }
  
  // Формируем вывод
  let output = '';
  output += `\n${'='.repeat(80)}\n`;
  output += `📦 ${patch.title}\n`;
  output += `${'='.repeat(80)}\n`;
  output += `\n🔖 Статус: ${patch.status || 'unknown'}\n`;
  output += `👤 Автор: ${patch.author || 'Unknown'}\n`;
  output += `📅 Дата: ${patch.date ? new Date(patch.date).toLocaleString('ru-RU') : 'N/A'}\n`;
  
  if (patch.tags && patch.tags.length > 0) {
    output += `🏷️  Теги: ${patch.tags.join(', ')}\n`;
  }
  
  if (patch.description) {
    output += `\n📝 Описание:\n${patch.description}\n`;
  }
  
  if (patch.content) {
    output += `\n📄 Содержимое:\n\n`;
    output += patch.content + '\n';
  }
  output += `\n${'='.repeat(80)}\n`;
  
  // Если --browser, открываем в браузере
  if (openInBrowser) {
    openPatchInBrowser(patch);
  }
  // Если --file, сохраняем в файл
  else if (outputToFile) {
    const filename = `patch-${patchId}.txt`;
    writeFileSync(filename, output, 'utf8');
    console.log(`✅ Патч сохранён в ${filename}`);
  } 
  // Иначе выводим в консоль
  else {
    // Выводим через Buffer для правильной кодировки
    process.stdout.write(Buffer.from(output, 'utf8'));
  }
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
} finally {
  await client.close();
}

function openPatchInBrowser(patch) {
  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${patch.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.7;
      background: #0d1117;
      color: #c9d1d9;
    }
    
    .header {
      background: linear-gradient(135deg, #1f6feb 0%, #8b5cf6 100%);
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 8px 32px rgba(31, 111, 235, 0.2);
    }
    
    .header h1 {
      color: white;
      font-size: 2em;
      margin-bottom: 15px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    
    .meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      color: rgba(255,255,255,0.9);
      font-size: 0.95em;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }
    
    .badge.dead { background: #6e7681; }
    .badge.active { background: #238636; }
    .badge.pending { background: #9e6a03; }
    
    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 10px;
    }
    
    .tag {
      background: rgba(255,255,255,0.1);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.85em;
      border: 1px solid rgba(255,255,255,0.2);
    }
    
    .content {
      background: #161b22;
      padding: 30px;
      border-radius: 8px;
      border: 1px solid #30363d;
    }
    
    .content h1, .content h2, .content h3 {
      color: #58a6ff;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    
    .content h1 { font-size: 2em; border-bottom: 2px solid #30363d; padding-bottom: 10px; }
    .content h2 { font-size: 1.5em; }
    .content h3 { font-size: 1.2em; }
    
    .content p { margin: 1em 0; }
    
    .content code {
      background: #0d1117;
      padding: 3px 6px;
      border-radius: 4px;
      color: #ff7b72;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
    }
    
    .content pre {
      background: #0d1117;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      border: 1px solid #30363d;
      margin: 1em 0;
    }
    
    .content pre code {
      background: none;
      padding: 0;
      color: #c9d1d9;
    }
    
    .content blockquote {
      border-left: 4px solid #58a6ff;
      padding-left: 16px;
      margin: 1em 0;
      color: #8b949e;
      font-style: italic;
    }
    
    .content ul, .content ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    
    .content li { margin: 0.5em 0; }
    
    .content hr {
      border: none;
      border-top: 1px solid #30363d;
      margin: 2em 0;
    }
    
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    
    .content th, .content td {
      padding: 8px 12px;
      border: 1px solid #30363d;
      text-align: left;
    }
    
    .content th {
      background: #0d1117;
      font-weight: 600;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #30363d;
      text-align: center;
      color: #8b949e;
      font-size: 0.9em;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js"></script>
</head>
<body>
  <div class="header">
    <h1>${patch.title}</h1>
    <div class="meta">
      <div class="meta-item">
        <span>📦</span>
        <span class="badge ${patch.status || 'pending'}">${patch.status || 'unknown'}</span>
      </div>
      <div class="meta-item">
        <span>👤</span>
        <span>${patch.author || 'Unknown'}</span>
      </div>
      <div class="meta-item">
        <span>📅</span>
        <span>${patch.date ? new Date(patch.date).toLocaleDateString('ru-RU') : 'N/A'}</span>
      </div>
    </div>
    ${patch.tags && patch.tags.length > 0 ? `
      <div class="tags">
        ${patch.tags.map(tag => `<span class="tag">🏷️ ${tag}</span>`).join('')}
      </div>
    ` : ''}
  </div>
  
  ${patch.description ? `
    <div style="background: #161b22; padding: 20px; border-radius: 8px; border-left: 4px solid #58a6ff; margin-bottom: 20px;">
      <strong style="color: #58a6ff;">📝 Описание:</strong>
      <p style="margin-top: 10px;">${patch.description}</p>
    </div>
  ` : ''}
  
  <div class="content" id="content"></div>
  
  ${patch.meta ? `
    <div style="background: #161b22; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #30363d;">
      <strong style="color: #58a6ff;">🔍 Метаданные:</strong>
      <pre style="margin-top: 10px;"><code>${JSON.stringify(patch.meta, null, 2)}</code></pre>
    </div>
  ` : ''}
  
  <div class="footer">
    <p>🎪 Patch Manager CLI — Obsidian для терминала 🗿</p>
    <p>ID: ${patch._id}</p>
  </div>
  
  <script>
    const markdown = ${JSON.stringify(patch.content || 'Нет содержимого')};
    marked.setOptions({
      breaks: true,
      gfm: true
    });
    document.getElementById('content').innerHTML = marked.parse(markdown);
  </script>
</body>
</html>
  `;
  
  // Сохраняем во временный файл
  const tmpFile = join(tmpdir(), `patch-${patch._id}.html`);
  writeFileSync(tmpFile, html, 'utf8');
  
  // Открываем в браузере (Windows)
  exec(`start "" "${tmpFile}"`);
  
  console.log('✅ Патч открыт в браузере! 🗿');
  console.log(`   Файл: ${tmpFile}`);
}
