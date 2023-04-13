import { Pokemon } from '../models/pokemon.js'
import { Move } from '../models/move.js'
import * as algorithms from '../data/algorithms.js'


const useMove = async (req, res) => {
  try {
    const move = await Move.findById(req.params.moveId)
    const user = await Pokemon.findById(req.params.userId)
    const target = await Pokemon.findById(req.params.targetId)
    const damage = algorithms.calcDamage(user, target, move)
    // console.log(damage)
    req.body.currentPP = move.currentPP -1
    await Move.findByIdAndUpdate(
      req.params.moveId,
      { currentPP: req.body.currentPP },
      { new: true }
    )
    if (target.currentHP - damage > 0) {
      const newHP = target.currentHP - damage
      console.log(`DOWN TO ${newHP}`)
      req.body.currentHP = newHP
      const updatedTarget = await Pokemon.findByIdAndUpdate(
        req.params.targetId,
        {currentHP: req.body.currentHP},
        { new: true }
      )
      res.status(201).json(updatedTarget)
    } else {
      console.log('DOWN TO ZERO')
      req.body.currentHP = 0
      const updatedTarget = await Pokemon.findByIdAndUpdate(
        req.params.targetId,
        {currentHP: req.body.currentHP},
        { new: true }
      )
      res.status(201).json(updatedTarget)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const findMove = async (req, res) => {
  try {
    const move = await Move.findById(req.params.moveId)
    res.status(200).json(move)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export { 
  useMove,
  findMove,
}