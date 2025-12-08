import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new Hono();
const port = 3000;

app.use('/*', cors());

// Direct MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'garden-patches';

const client = await MongoClient.connect(mongoUri);
const db = client.db(dbName);

app.get('/api/projects', async (c) => {
  try {
    const projects = await db.collection('projects').find({}).toArray();
    return c.json(projects);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
}); const projectsCollection = await mongo.getCollection<ProjectDoc>('projects');
    const projects = await projectsCollection.find({}).toArray();
    return c.json(projects);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/patches', async (c) => {
app.get('/api/patches', async (c) => {
  try {
    const patches = await db.collection('patches').find({}).toArray();
    return c.json(patches);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
app.get('/api/patches/:id', async (c) => {
  const patchId = c.req.param('id');
app.get('/api/patches/:id', async (c) => {
  const patchId = c.req.param('id');
  try {
    const patch = await db.collection('patches').findOne({ patch_id: patchId });
    
    if (!patch) {
      return c.json({ error: 'Patch not found' }, 404);
    }
    
    return c.json(patch);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});sole.log(`🚀 Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
