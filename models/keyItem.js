import mongoose from 'mongoose'

const Schema = mongoose.Schema

const keyItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
},{
  timestamps: true,
})

const KeyItem = mongoose.model('KeyItem', keyItemSchema)

export { KeyItem }