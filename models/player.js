import mongoose, { Schema } from 'mongoose';

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

const twisterRacesDB = mongoose.connection.useDb('twister-races');
const Player = twisterRacesDB.model('Player', playerSchema, 'players');

export default Player;
