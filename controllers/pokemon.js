import { Pokemon } from '../models/pokemon.js'
import { bulbasaur } from '../data/bulbasaur.js';

const create = async (req, res) => {
  try {
    req.body.author = req.user.profile;

    const pokemon = await Pokemon.create(req.body);
    // const profile = await Profile.findByIdAndUpdate(
    //   req.user.profile,
    //   { currentStatus: req.body.emotion, $push: { emotionPosts: emotionPost } },
    //   { new: true }
    // );

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