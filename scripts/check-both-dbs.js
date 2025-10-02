require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define a simple Lesson schema for querying
const lessonSchema = new mongoose.Schema({}, { strict: false, collection: 'lessons' });
const Lesson = mongoose.model('Lesson', lessonSchema);

async function checkDatabase(uri, name) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 Checking ${name}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 URI: ${uri.replace(/:[^:@]+@/, ':****@')}`);
  
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected successfully!');
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database Name: ${dbName}`);
    
    const lessons = await Lesson.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`\n📝 Total lessons found: ${lessons.length}`);
    
    if (lessons.length > 0) {
      console.log('\n📚 Recent lessons:');
      lessons.forEach((lesson, i) => {
        console.log(`\n  ${i + 1}. ${lesson.title}`);
        console.log(`     Type: ${lesson.type}`);
        console.log(`     Slug: ${lesson.slug || 'N/A'}`);
        console.log(`     Published: ${lesson.isPublished ? 'Yes' : 'No'}`);
        console.log(`     Created: ${lesson.createdAt || 'N/A'}`);
        if (lesson.type === 'quiz' && lesson.quiz) {
          console.log(`     Quiz Questions: ${lesson.quiz.questions?.length || 0}`);
        }
      });
    } else {
      console.log('   ⚠️ No lessons found in this database');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from', name);
    
  } catch (error) {
    console.error(`\n❌ Error checking ${name}:`, error.message);
  }
}

async function main() {
  console.log('\n🔎 DATABASE COMPARISON TOOL\n');
  
  const atlasUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://localhost:27017/adamur_dev';
  
  if (!atlasUri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }
  
  console.log('Current MONGODB_URI from .env.local:');
  console.log(atlasUri.includes('localhost') ? '❌ LOCAL' : '✅ ATLAS');
  
  // Check Atlas
  await checkDatabase(atlasUri, 'Atlas Database (adamur_production)');
  
  // Wait a bit between connections
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check Local
  await checkDatabase(localUri, 'Local Database (adamur_dev)');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Database comparison complete!');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
