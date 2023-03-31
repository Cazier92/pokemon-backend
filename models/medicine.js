import mongoose from 'mongoose'

const Schema = mongoose.Schema

const medicineSchema = new Schema({
  name: { type: String, required: true },
  affects: [{
    type: String,
    enum: [
      'totalHP', 'attack', 'spAttack', 'defense', 'spDefense', 'speed', 'level', 'status', 'totalPP', 'currentPP', 'currentHP'
    ]
  }],
  value: Number | null,
  description: { type: String, required: true },
},{
  timestamps: true,
})

const Medicine = mongoose.model('Medicine', medicineSchema)

export { Medicine }