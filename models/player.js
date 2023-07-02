import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const playerSchema = new Schema({
  login: {
    type: String,
    required: true,
  },
  nickname: {
    current: {
      type: String,
      required: true,
    },
    previous: {
      type: String,
    },
  },
  update: {
    type: Date,
    required: true,
  },
});

const Player = mongoose.model('Player', playerSchema);

export default Player;
