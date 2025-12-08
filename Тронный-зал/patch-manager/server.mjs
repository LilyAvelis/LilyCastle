#!/usr/bin/env node

/**
 * Patch Manager Web Server
 * 
 * Express сервер который подает патчи из MongoDB Atlas
 * Доступно:
 * - GET /api/patches          - все патчи
 * - GET /api/patches/:id      - один патч
 * - GET /api/projects         - все проекты
 * - GET /health               - проверка здоровья сервера
 */

import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// ============================================================================
// КОНФИГ
// ============================================================================

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'garden-patches';

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================

const app = express();
let client = null;
let db = null;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// ROUTES: Health Check
// ============================================================================

app.get('/health', (req, res) => {
  const isDbConnected = db ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: isDbConnected,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ROUTES: Patches API
// ============================================================================

/**
 * GET /api/patches
 * Возвращает все патчи с опциональной фильтрацией
 */
app.get('/api/patches', async (req, res) => {
  try {
    const { status, author, tag } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (author) filter.author = new RegExp(author, 'i');
    if (tag) filter.tags = { $in: [tag] };

    const patches = await db.collection('patches')
      .find(filter)
      .sort({ created_at: -1 })
      .toArray();

    res.json({
      total: patches.length,
      patches
    });
  } catch (error) {
    console.error('Error fetching patches:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/patches/:id
 * Возвращает один патч по ID
 */
app.get('/api/patches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Пытаемся найти по patch_id (текстовый идентификатор)
    let patch = await db.collection('patches').findOne({ patch_id: id });
    
    // Если не нашли, пытаемся по _id (MongoDB ObjectId)
    if (!patch) {
      const { ObjectId } = await import('mongodb');
      try {
        patch = await db.collection('patches').findOne({ _id: new ObjectId(id) });
      } catch (e) {
        // ObjectId parse failed - это OK
      }
    }

    if (!patch) {
      return res.status(404).json({ error: 'Patch not found' });
    }

    res.json(patch);
  } catch (error) {
    console.error('Error fetching patch:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ROUTES: Projects API
// ============================================================================

/**
 * GET /api/projects
 * Возвращает все проекты
 */
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.collection('projects')
      .find({})
      .toArray();

    res.json({
      total: projects.length,
      projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ROUTES: Root
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    name: 'Patch Manager API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      patches: {
        list: 'GET /api/patches?status=completed&author=Sofia&tag=circus',
        detail: 'GET /api/patches/:id'
      },
      projects: {
        list: 'GET /api/projects'
      }
    }
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function start() {
  try {
    console.log('🔌 Подключаюсь к MongoDB Atlas...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(MONGO_DB);
    
    // Проверяем подключение
    await db.admin().ping();
    console.log('✅ MongoDB Atlas подключена!\n');

    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
      console.log(`📊 API доступен на http://localhost:${PORT}/api/patches`);
      console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
    });

  } catch (error) {
    console.error('❌ Ошибка при запуске:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Выключаюсь...');
  if (client) {
    await client.close();
    console.log('✅ Соединение закрыто');
  }
  process.exit(0);
});

// Запуск
start();
