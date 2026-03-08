import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const uri = process.env.MONGODB_URI || mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`MongoDB Connected successfully to Mock In-Memory URI: ${uri}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
