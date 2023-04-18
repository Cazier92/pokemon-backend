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
          const msg = `Yes! The wild ${updatedPokemon.name} was caught! It has been added to your party!`
          res.status(201).json([updatedProfile, updatedPokemon, msg])
        } else {
          const updatedProfile = await Profile.findByIdAndUpdate(
            req.user.profile,
            { $push: { pokemonPC: updatedPokemon } },
            { new: true }
          )
          const msg = `Yes! The wild ${updatedPokemon.name} was caught! Your party is full, so it has been sent to your PC.`
          res.status(201).json([updatedProfile, updatedPokemon, msg])
        }
      } else {
        await Ball.findByIdAndDelete(req.params.ballId)
        const msg = `Oh no! The wild ${pokemon.name} escaped!`
        const updatedProfile = await Profile.findById(req.user.profile)
        res.status(200).json([updatedProfile, msg, true])
        // res.status(401).json('Pokemon Escaped!')
      }
    } else if (pokemon.currentHP <= 0) {
      res.status(418).json([user, 'Pokemon is fainted!', false])
    } else {
      res.status(418).json([user, `Cannot catch another person's pokemon!!!`, false])
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
        req.body.currentHP = (pokemon.totalHP * medicine.reviveHP)
        const updatedPokemon = await Pokemon.findByIdAndUpdate(
          req.params.pokemonId,
          { currentHP: req.body.currentHP },
          { new: true }
        )
        await Medicine.findByIdAndDelete(req.params.medicineId)
        const updatedProfile = await Profile.findById(req.user.profile)
        const msg = `${updatedPokemon.name} was revived!`
        res.status(200).json([updatedProfile, updatedPokemon, msg])
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
        const msg = `${updatedPokemon.name} was healed!`
        res.status(200).json([updatedProfile, updatedPokemon, msg])
      } else {
        res.status(418).json('Cannot use on fainted pokemon.')
      }
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const faintWildPokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.pokemonId)
    if (pokemon.currentHP <= 0) {
      const allPokemon = await Pokemon.find({})
      let matchingPkmn = []
      allPokemon.forEach(pkmn => {
        if (pkmn.name === pokemon.name) {
          matchingPkmn.push(pkmn)
        }
      })
      if (matchingPkmn.length > 1) {
        const deletedPokemon = await Pokemon.findByIdAndDelete(req.params.pokemonId)
        res.status(200).json(deletedPokemon)
      } else {
        res.status(304).json(pokemon)
      }
    } else {
      res.status(418).json('HP is greater than 0!')
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
  faintWildPokemon,
}