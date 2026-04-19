import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import reachoutRoutes from './routes/reachoutRoutes.js';
import serverless from 'serverless-http';


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

connectDB();

app.use('/api/reachouts', reachoutRoutes)
app.use('/api', authRoutes);
app.use('/api/projects', projectRoutes);


const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    await connectDB();

    return await serverlessHandler(event, context);
};


