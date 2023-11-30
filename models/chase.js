import mongoose, { Schema } from 'mongoose';

const chaseSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
});

const chaseDB = mongoose.connection.useDb('race-chase');
const Chase = chaseDB.model('Chase', chaseSchema, 'dates');

export default Chase;
