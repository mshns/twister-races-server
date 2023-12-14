import mongoose from 'mongoose';

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_DB)
    .then(() => console.log('✅ connected to database'))
    .catch((error) => console.log(`❌ database connection error: ${error}`));
};

export default connectDatabase;
