import mongoose from 'mongoose'

const Schema = mongoose.Schema

const packSchema = new Schema({
  medicinePocket: [{type: Schema.Types.ObjectId, ref: 'Medicine'}],
  machinePocket: [{type: Schema.Types.ObjectId, ref: 'Machine'}],
  ballPocket: [{type: Schema.Types.ObjectId, ref: 'Ball'}],
},{
  timestamps: true,
})

const Pack = mongoose.model('Pack', packSchema)

export { Pack }
