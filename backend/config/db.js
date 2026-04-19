import mongoose from 'mongoose';

// Cache the connection state across warm starts
let isConnected = false;

export const connectDB = async () => {
    // If already connected, use the existing connection
    if (isConnected) {
        console.log('=> Using existing MongoDB connection');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        // Set the state to true once successfully connected
        isConnected = db.connections[0].readyState === 1;
        console.log('MongoDB Connected to MCM');
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err; // Use throw instead of process.exit(1) in Serverless
    }
};