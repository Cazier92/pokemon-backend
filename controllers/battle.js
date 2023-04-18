import { Pokemon } from '../models/pokemon.js'
import { Profile } from '../models/profile.js'
import { Move } from '../models/move.js'
import { Ball } from '../models/ball.js'
import { Medicine } from '../models/medicine.js'
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
    const user = await Profile.findById(req.user.profile)
    if (pokemon.currentHP > 0 && !pokemon.owner) {
      const isCaught = algorithms.catchPokemon(pokemon, ball)
      console.log(algorithms.catchPokemon(pokemon, ball))
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
          res.status(201).json([updatedProfile, updatedPokemon])
        } else {
          const updatedProfile = await Profile.findByIdAndUpdate(
            req.user.profile,
            { $push: { pokemonPC: updatedPokemon } },
            { new: true }
          )
          res.status(201).json([updatedProfile, updatedPokemon])
        }
      } else {
        await Ball.findByIdAndDelete(req.params.ballId)
        const updatedProfile = await Profile.findById(req.user.profile)
        res.status(200).json([updatedProfile, pokemon])
        // res.status(401).json('Pokemon Escaped!')
      }
    } else if (pokemon.currentHP <= 0) {
      res.status(401).json('Pokemon is fainted!')
    } else {
      res.status(401).json(`Cannot catch another person's pokemon!!!`)
      // res.status(200).json([user, pokemon])
    }
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
        const updatedProfile = await Profile.findById(req.user.profile)
        res.status(201).json([updatedProfile, updatedPokemon])
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
  useMove,
  findMove,
  useBall,
  useMedicine,
}