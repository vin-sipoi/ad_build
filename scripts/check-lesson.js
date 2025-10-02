// Run this script to verify where the lesson was saved
// Usage: node scripts/check-lesson.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkLesson() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📍 URI:', MONGODB_URI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://***:***@'));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log('📊 Database Name:', dbName);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Check lessons collection
    console.log('\n🔍 Checking lessons collection...');
    const lessonsCollection = mongoose.connection.db.collection('lessons');
    const lessonCount = await lessonsCollection.countDocuments();
    console.log(`📝 Total lessons found: ${lessonCount}`);

    if (lessonCount > 0) {
      console.log('\n📄 Latest lesson:');
      const latestLesson = await lessonsCollection.findOne(
        {}, 
        { sort: { createdAt: -1 } }
      );
      console.log(JSON.stringify(latestLesson, null, 2));
    } else {
      console.log('\n⚠️  No lessons found in the lessons collection!');
      
      // Check if data might be in a different collection
      console.log('\n🔍 Checking for lesson-like collections...');
      const lessonLikeCollections = collections.filter(col => 
        col.name.toLowerCase().includes('lesson')
      );
      
      if (lessonLikeCollections.length > 0) {
        console.log('Found these lesson-related collections:');
        for (const col of lessonLikeCollections) {
          const count = await mongoose.connection.db.collection(col.name).countDocuments();
          console.log(`  - ${col.name}: ${count} documents`);
        }
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkLesson();
