import mongoose from 'mongoose'

const Schema = mongoose.Schema

const itemSchema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'ball', 'key', 'machine', 'medicine', 'holdItem'
    ],
    required: true,
  },
  bonus: Number,
  value: Number,
  affects: [{
    type: String,
    enum: [
      'hp', 'attack', 'spAttack', 'defense', 'spDefense', 'speed', 'level', 'status'
    ]
  }]
},{
  timestamps: true,
})

const Item = mongoose.model('Item', itemSchema)

export { Item }