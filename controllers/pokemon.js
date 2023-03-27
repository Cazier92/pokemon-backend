import { Pokemon } from '../models/pokemon.js'
import { bulbasaur } from '../data/bulbasaur.js';

const create = async (req, res) => {
  try {
    let potentialMoves = []
    bulbasaur.moves.forEach(move => {
      potentialMoves.push(move)
    })
    req.body.potentialMoves = potentialMoves
    let moveSet = []
    let eggMoves = []
    bulbasaur.moves.forEach(move => {
      if (move.version_group_details[0].move_learn_method.name === 'egg') {
        eggMoves.push(move)
      }
    })
    let randomNum = Math.ceil(Math.random()*4)
    
    for (let i = randomNum; i >= 0; i--) {
      let eggRandom = Math.floor(Math.random() * eggMoves.length)
      moveSet.push(eggMoves[eggRandom])
    }
    req.body.moveSet = moveSet
    const pokemon = await Pokemon.create(req.body);
    res.status(201).json(pokemon);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const test = async(req, res) => {
  try {
    let theseMoves = []
    bulbasaur.moves.forEach(move => {
      if (move.version_group_details[0].move_learn_method.name === 'egg') {
        theseMoves.push(move)
      }
    })

    const testPokemon = {
      name: 'bulbasaur',
      moves: []
    }
    res.status(200).json(testPokemon);
  } catch (error) {
    console.log(error, "Show Controller Error");
    res.status(500).json(error);
  }
}

export { 
  create,
  test,
}