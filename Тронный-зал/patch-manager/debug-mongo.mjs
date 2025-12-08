import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const MONGO_DB = 'garden-patches';

async function debug() {
    const client = await MongoClient.connect(MONGO_URI);
    const db = client.db(MONGO_DB);
    const patches = db.collection('patches');
    
    console.log('Count:', await patches.countDocuments());
    
    const cursor = patches.find({});
    console.log('Cursor created');
    
    const arr = await cursor.toArray();
    console.log('Array length:', arr.length);
    
    if (arr.length > 0) {
        console.log('First patch:', arr[0].patch_id);
    } else {
        console.log('Array is empty! Checking with limit...');
        const limited = await patches.find({}).limit(1).toArray();
        console.log('Limited result:', limited.length);
        
        if (limited.length > 0) {
            console.log('Found with limit:', limited[0].patch_id);
        }
    }
    
    await client.close();
}

debug().catch(console.error);
