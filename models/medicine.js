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
  value: { type: Number, required: true },
  condition: {
    type: String,
    enum: [
      'paralyze',
      'sleep',
      'freeze',
      'confuse',
      'burn',
      'poison',
      'all'
    ]
  },
  description: { type: String, required: true },
},{
  timestamps: true,
})

const Medicine = mongoose.model('Medicine', medicineSchema)

export { Medicine }