import mongoose from 'mongoose'

const Schema = mongoose.Schema

const ballSchema = new Schema({
  name: { type: String, required: true },
  bonus: { type: Number, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
},{
  timestamps: true,
})

const Ball = mongoose.model('Ball', ballSchema)

export { Ball }