import { Pack } from '../models/map.js'
import { Ball } from '../models/ball.js'
import { Machine } from '../models/machine.js'
import { Medicine } from '../models/medicine.js'
import { KeyItem } from '../models/keyItem.js'

const index = async (req, res) => {
  try {
    const packs = await Pack.find({})
    res.status(200).json(packs)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const show = async (req, res) => {
  try {
    const pack = await Pack.findOne({ owner: req.user.profile })
    res.status(200).json(pack)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const createBall = async (req, res) => {
  try {
    const ball = await Ball.create(req.body)
    const pack = await Pack.findByIdAndUpdate(
      req.params.id,
      { $push: { ballPocket: ball }},
      { new: true }
    ).populate('ballPocket')
    res.status(201).json(pack)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body)
    const pack = await Pack.findByIdAndUpdate(
      req.params.id,
      { $push: { medicinePocket: medicine }},
      { new: true }
    ).populate('medicinePocket')
    res.status(201).json(pack)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const createMachine = async (req, res) => {
  try {
    const machine = await Machine.create(req.body)
    const pack = await Pack.findByIdAndUpdate(
      req.params.id,
      { $push: { machinePocket: machine }},
      { new: true }
    ).populate('machinePocket')
    res.status(201).json(pack)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const createKeyItem = async (req, res) => {
  try {
    const keyItem = await KeyItem.create(req.body)
    const pack = await Pack.findByIdAndUpdate(
      req.params.id,
      { $push: { keyItemPocket: keyItem }},
      { new: true }
    ).populate('machinePocket')
    res.status(201).json(pack)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}


export { 
  index,
  show,
  createBall,
  createMedicine,
  createMachine,
  createKeyItem,
}