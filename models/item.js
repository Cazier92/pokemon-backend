import mongoose from 'mongoose'

const Schema = mongoose.Schema

const itemSchema = new Schema({
  name: String,
  photo: String,
  party: [{type: Schema.Types.ObjectId, ref: 'Pokemon', max: 6 }],
  pokemonPC: [{type: Schema.Types.ObjectId, ref: 'Pokemon'}],
},{
  timestamps: true,
})

const Item = mongoose.model('Item', itemSchema)

export { Item }