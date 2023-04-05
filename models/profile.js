import mongoose from 'mongoose'

const Schema = mongoose.Schema

const positionSchema = new Schema({
  x: {type: Number, required: true, default: 0},
  y: {type: Number, required: true, default: 0},
  land: Boolean
},{
  timestamps: true,
})

const profileSchema = new Schema({
  name: String,
  photo: String,
  party: [{type: Schema.Types.ObjectId, ref: 'Pokemon', max: 6 }],
  pokemonPC: [{type: Schema.Types.ObjectId, ref: 'Pokemon'}],
  pack: { type: Schema.Types.ObjectId, ref: 'Pack' },
  wallet: {type: Number, min: 0, max: 1000000, default: 0},
  currentMap: { type: Schema.Types.ObjectId, ref: 'Map' },
  coordinates: {
    type: positionSchema,
    default: {
      x: 0,
      y: 0,
      land: true,
    }
  },
},{
  timestamps: true,
})

const Profile = mongoose.model('Profile', profileSchema)

export { Profile }
