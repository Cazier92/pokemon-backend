import mongoose from 'mongoose'

const Schema = mongoose.Schema

const packSchema = new Schema({
  owner: {type: Schema.Types.ObjectId, ref: 'Profile'},
  medicinePocket: [{type: Schema.Types.ObjectId, ref: 'Medicine'}],
  machinePocket: [{type: Schema.Types.ObjectId, ref: 'Machine'}],
  ballPocket: [{type: Schema.Types.ObjectId, ref: 'Ball'}],
  keyItemPocket: [{type: Schema.Types.ObjectId, ref: 'KeyItem'}],
  newPack: { type: Boolean, required: true, default: true }
},{
  timestamps: true,
})

const Pack = mongoose.model('Pack', packSchema)

export { Pack }
