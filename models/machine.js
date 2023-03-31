import mongoose from 'mongoose'

const Schema = mongoose.Schema

const machineSchema = new Schema({
  name: { type: String, required: true },
  move: { type: String, required: true },
  value: {
    type: String,
    required: true,
    enum: [
      'HM', 'TM'
    ]
  },
  description: { type: String, required: true },
},{
  timestamps: true,
})

const Machine = mongoose.model('Machine', machineSchema)

export { Machine }