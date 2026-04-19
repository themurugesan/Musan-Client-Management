import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/mcm');

    // Clear existing
    await User.deleteMany({});

    // Create Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedPassword });



    console.log('Database Seeded! Login with: admin / admin123');
    process.exit();
};

seedDatabase();