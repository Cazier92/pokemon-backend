import mongoose from 'mongoose'

const Schema = mongoose.Schema

const profileSchema = new Schema({
  name: String,
  photo: String,
  party: [{type: Schema.Types.ObjectId, ref: 'Pokemon', max: 6 }],
  pokemonPC: [{type: Schema.Types.ObjectId, ref: 'Pokemon'}],
  pack: { type: Schema.Types.ObjectId, ref: 'Pack' },
},{
  timestamps: true,
})

const Profile = mongoose.model('Profile', profileSchema)

export { Profile }
