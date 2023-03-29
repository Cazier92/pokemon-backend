import { Pokemon } from '../models/pokemon.js'
import { bulbasaur } from '../data/bulbasaur.js';
import axios from 'axios';

const create = async (req, res) => {
  try {
    const pokemon = await Pokemon.create(req.body);
    res.status(201).json(pokemon);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const updatePokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('owner')
    res.status(200).json(pokemon)
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

const evolvePokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id)
    let evolvePokemon
    if (req.body.item) {
      pokemon.evolvesTo.forEach(evolution => {
        if (evolution.item === req.body.item) {
          evolvePokemon = evolution.name
        }
      })
    } else {
      pokemon.evolvesTo.forEach(evolution => {
        if (evolution.trigger === 'level-up' && pokemon.level === evolution.minLevel) {
          evolvePokemon = evolution.name
        }
      })
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

// const test = async(req, res) => {
//   try {
//     let theseMoves = []
//     bulbasaur.moves.forEach(move => {
//       if (move.version_group_details[0].move_learn_method.name === 'egg') {
//         theseMoves.push(move)
//       }
//     })

//     const testPokemon = {
//       name: 'bulbasaur',
//       moves: []
//     }
//     res.status(200).json(testPokemon);
//   } catch (error) {
//     console.log(error, "Show Controller Error");
//     res.status(500).json(error);
//   }
// }

export { 
  create,
  
}