const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const Course = require('./src/models/Course');
const Topic = require('./src/models/Topic');

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adamur_dev');
    console.log('Connected to MongoDB');

    // Check if courses exist
    const courseCount = await Course.countDocuments();
    console.log(`Found ${courseCount} courses`);

    if (courseCount === 0) {
      // Create sample courses
      const sampleCourses = [
        {
          title: 'Blockchain Fundamentals',
          slug: 'blockchain-fundamentals',
          description: 'Learn the basics of blockchain technology',
          track: 'blockchain',
          difficulty: 'beginner',
          estimatedHours: 10,
          imageUrl: '/course-placeholder.jpg',
          tags: ['blockchain', 'fundamentals'],
          isActive: true
        },
        {
          title: 'Smart Contracts Development',
          slug: 'smart-contracts-development',
          description: 'Build and deploy smart contracts',
          track: 'development',
          difficulty: 'intermediate',
          estimatedHours: 15,
          imageUrl: '/course-placeholder.jpg',
          tags: ['smart-contracts', 'solidity'],
          isActive: true
        }
      ];

      const createdCourses = await Course.insertMany(sampleCourses);
      console.log(`Created ${createdCourses.length} courses`);

      // Create sample topics for each course
      const sampleTopics = [
        {
          title: 'Introduction to Blockchain',
          slug: 'introduction-to-blockchain',
          description: 'Understanding the basics of blockchain',
          courseId: createdCourses[0]._id,
          order: 1,
          isActive: true
        },
        {
          title: 'Cryptocurrency Basics',
          slug: 'cryptocurrency-basics',
          description: 'Learn about digital currencies',
          courseId: createdCourses[0]._id,
          order: 2,
          isActive: true
        },
        {
          title: 'Setting up Development Environment',
          slug: 'setting-up-development-environment',
          description: 'Prepare your workspace for smart contract development',
          courseId: createdCourses[1]._id,
          order: 1,
          isActive: true
        },
        {
          title: 'Writing Your First Smart Contract',
          slug: 'writing-your-first-smart-contract',
          description: 'Create a simple smart contract with Solidity',
          courseId: createdCourses[1]._id,
          order: 2,
          isActive: true
        }
      ];

      const createdTopics = await Topic.insertMany(sampleTopics);
      console.log(`Created ${createdTopics.length} topics`);
    } else {
      console.log('Courses already exist, skipping seed data');
    }

    console.log('✅ Seed data complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();