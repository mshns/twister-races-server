import mongoose from 'mongoose';

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_PRIVATE_URL)
    .then(() => console.log('✅ connected to database'))
    .catch((error) => console.log(`❌ database connection error: ${error}`));
};

export default connectDatabase;
