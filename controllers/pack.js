import { Pack } from '../models/pack.js'
import { Ball } from '../models/ball.js'
import { Machine } from '../models/machine.js'
import { Medicine } from '../models/medicine.js'
import { KeyItem } from '../models/keyItem.js'
import { Pokemon } from '../models/pokemon.js'

const index = async (req, res) => {
  try {
    const packs = await Pack.find({})
    .populate('ballPocket')
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

const setNewPack = async (req, res) => {
  try {
    const pack = await Pack.findByIdAndUpdate(
      req.params.id,
      { newPack: true },
      { new: true }
      )
    .populate('owner')
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
    )
    .populate('ballPocket')
    .populate('medicinePocket')
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
    )
    .populate('medicinePocket')
    .populate('ballPocket')
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

const useMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.medicineId)
    const pokemon = await Pokemon.findById(req.params.pokemonId)

    if (medicine.revive) {
      if (pokemon.currentHP <= 0) {
        req.body.currentHP = (pokemon.totalHP * reviveHP)
        const updatedPokemon = await Pokemon.findByIdAndUpdate(
          req.params.pokemonId,
          { currentHP: req.body.currentHP },
          { new: true }
        )
        res.status(201).json(updatedPokemon)
      } else {
        res.status(418).json('Cannot use on unfainted pokemon.')
      }
    } else {
      if (pokemon.currentHP > 0) {
        if (medicine.affects.includes('currentHP')) {
          if (pokemon.currentHP < pokemon.totalHP || (medicine.affects.includes('status') && pokemon.statusCondition)) {
            if (medicine.value + pokemon.currentHP <= pokemon.totalHP) {
              req.body.currentHP = medicine.value + pokemon.currentHP
            } else {
              req.body.currentHP = pokemon.totalHP
            }
          } else {
            res.status(418).json('Pokemon is already at full health!')
            return
          }
        }
        if (medicine.affects.includes('status')) {
          if (pokemon.statusCondition || (medicine.affects.includes('currentHP') && pokemon.currentHP < pokemon.totalHP)) {
            if (pokemon.statusCondition === medicine.condition || medicine.condition === 'all') {
              req.body.statusCondition = null
            } else {
              res.status(418).json(`Pokemon does not have status condition: ${medicine.condition}`)
              return
            }
          } else {
            res.status(418).json('Pokemon has no status condition!')
            return
          }
        }
        const updatedPokemon = await Pokemon.findByIdAndUpdate(
          req.params.pokemonId,
          req.body,
          { new: true }
        )
        await Medicine.findByIdAndDelete(req.params.medicineId)
        res.status(201).json(updatedPokemon)
      } else {
        res.status(418).json('Cannot use on fainted pokemon.')
      }
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}


export { 
  index,
  show,
  changePackStatus,
  setNewPack,
  createBall,
  createMedicine,
  createMachine,
  createKeyItem,
  useMedicine,
}