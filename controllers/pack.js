import { Pack } from '../models/pack.js'
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
    .populate('owner')
    .populate('medicinePocket')
    .populate('machinePocket')
    .populate('ballPocket')
    .populate('keyItemPocket')
    res.status(200).json(pack)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const changePackStatus = async (req, res) => {
  try {
    const pack = await Pack.findOneAndUpdate(
      { owner: req.user.profile },
      { newPack: false },
      { new: true }
    ).populate('owner')
    .populate('medicinePocket')
    .populate('machinePocket')
    .populate('ballPocket')
    .populate('keyItemPocket')
    res.status(201).json(pack)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const createBall = async (req, res) => {
  try {
    const userPack = await Pack.findOne({ owner: req.user.profile })
    const ball = await Ball.create(req.body)
    const pack = await Pack.findByIdAndUpdate(
      userPack._id,
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
    const userPack = await Pack.findOne({ owner: req.user.profile })
    const medicine = await Medicine.create(req.body)
    const pack = await Pack.findByIdAndUpdate(
      userPack._id,
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
    const userPack = await Pack.findOne({ owner: req.user.profile })
    const machine = await Machine.create(req.body)
    const pack = await Pack.findByIdAndUpdate(
      userPack._id,
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
    const userPack = await Pack.findOne({ owner: req.user.profile })
    const keyItem = await KeyItem.create(req.body)
    const pack = await Pack.findByIdAndUpdate(
      userPack._id,
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
  changePackStatus,
  createBall,
  createMedicine,
  createMachine,
  createKeyItem,
}