import mongoose from 'mongoose';

// mongodb connection
export const mongodbConnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDb connected: ${connect.connection.host}`.bgGreen);
  } catch (error) {
    console.log(error.message);
  }
};
