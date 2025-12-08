const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

async function updateReport() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('garden-patches');
  
  const content = JSON.stringify(JSON.parse(fs.readFileSync('temp_content.json', 'utf8')));
  
  await db.collection('patches').updateOne(
    { _id: new ObjectId('69363d16c527f3840fb3ee60') },
    { $set: { content: content } }
  );
  
  console.log('Report updated with full content');
  await client.close();
}

updateReport().catch(console.error);