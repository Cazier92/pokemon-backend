import axios from "axios";

const findPokemon = async (req, res) => {
  try {
    const pokemon = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.params.name}`)
    res.status(200).json(pokemon.data)
  } catch (error) {
    res.status(500).json(error)
  }
}

const findMove = async (req, res) => {
  try {
    const move = await axios.get(`${req.body.url}`)
    res.status(200).json(move.data)
  } catch (error) {
    res.status(500).json(error)
  }
}


export {
  findPokemon,
  findMove,
}