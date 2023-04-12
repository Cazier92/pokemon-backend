import { Pokemon } from '../models/pokemon.js'
import { Profile } from '../models/profile.js'
import { Move } from '../models/move.js'
import axios from 'axios'
import * as algorithms from '../data/algorithms.js'


const useMove = async (req, res) => {
  try {
    const move = await Move.findById(req.params.moveId)
    const user = await Pokemon.findById(req.params.userId)
    const target = await Pokemon.findById(req.params.targetId)
    
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export { 
  useMove,
}