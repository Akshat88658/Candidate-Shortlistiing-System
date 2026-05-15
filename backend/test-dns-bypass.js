const mongoose = require('mongoose');

const testURI = 'mongodb://shandilya041_db_user:hRKlGIxZ426hDaLz@ac-ne8kv9d-shard-00-00.v1sh0vo.mongodb.net:27017,ac-ne8kv9d-shard-00-01.v1sh0vo.mongodb.net:27017,ac-ne8kv9d-shard-00-02.v1sh0vo.mongodb.net:27017/?ssl=true&replicaSet=atlas-w9ly8y-shard-0&authSource=admin&retryWrites=true&w=majority';
// Wait, I don't know the exact replicaSet name. Often it works without it if we just provide the nodes, or I can try a quick connection test without replicaSet param.

async function test() {
  try {
    await mongoose.connect('mongodb://shandilya041_db_user:hRKlGIxZ426hDaLz@ac-ne8kv9d-shard-00-00.v1sh0vo.mongodb.net:27017,ac-ne8kv9d-shard-00-01.v1sh0vo.mongodb.net:27017,ac-ne8kv9d-shard-00-02.v1sh0vo.mongodb.net:27017/?ssl=true&authSource=admin');
    console.log('✅ Connected without replicaSet name!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}
test();
