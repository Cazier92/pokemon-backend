import mongoose from 'mongoose'

const Schema = mongoose.Schema

const moveSchema = new Schema({
  name: {type: String, required: true},
  type: {type: String, required: true},
  accuracy: {type: Number || null},
  effect: {type: String, required: true},
  effectChance: {type: Number || null},
  damageClass: {type: String, required: true},
  totalPP: {type: Number, required: true},
  currentPP: {type: Number, required: true},
  power: {type: Number || null},
  priority: {type: Number, required: true},
},{
  timestamps: true,
})

const Move = mongoose.model('Move', moveSchema)

export { Move }