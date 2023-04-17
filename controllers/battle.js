import { Pokemon } from '../models/pokemon.js'
import { Profile } from '../models/profile.js'
import { Move } from '../models/move.js'
import { Ball } from '../models/ball.js'
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

const useBall = async (req, res) => {
  try {
    const ball = await Ball.findById(req.params.ballId)
    const pokemon = await Pokemon.findById(req.params.pokemonId)
    if (pokemon.currentHP > 0) {
      const isCaught = algorithms.catchPokemon(pokemon, ball)
      console.log(algorithms.catchPokemon(pokemon, ball))
      const user = await Profile.findById(req.user.profile)
      // await Ball.findByIdAndDelete(req.params.ballId)
      if (isCaught) {
        const updatedPokemon = await Pokemon.findByIdAndUpdate(
          req.params.pokemonId,
          { owner: req.user.profile, originalOwner: req.user.profile },
          { new: true }
        )
        if (user.party.length < 6) {
          const updatedProfile = await Profile.findByIdAndUpdate(
            req.user.profile,
            { $push: { party: updatedPokemon } },
            { new: true }
          )
          console.log(updatedPokemon)
          res.status(201).json(updatedProfile)
        } else {
          const updatedProfile = await Profile.findByIdAndUpdate(
            req.user.profile,
            { $push: { pokemonPC: updatedPokemon } },
            { new: true }
          )
          res.status(201).json(updatedProfile)
        }
      } else {
        await Ball.findByIdAndDelete(req.params.ballId)
        res.status(200).json(user)
        // res.status(401).json('Pokemon Escaped!')
      }
    } else {
      res.status(401).json('Pokemon is fainted!')
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export { 
  useMove,
  findMove,
  useBall,
}