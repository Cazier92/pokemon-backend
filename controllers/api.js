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



const generatePokemon = async (req, res) => {
  try {
    const foundPokemon = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.params.num}`)

    let potMoves = []

    foundPokemon.data.moves.forEach(move => {
      potMoves.push(
        {
          name: `${move.move.name}`,
          url: `${move.move.url}`,
          level: move.version_group_details[0].level_learned_at,
          method: `${move.version_group_details[0].move_learn_method.name}`,
        }
      )
    })


    let eggMoves = []

    foundPokemon.data.moves.forEach(move => {
      if (move.version_group_details[0].move_learn_method.name === 'egg') {
        eggMoves.push(move)
      }
    })

    let preMoveSet = []

    let randomNum = Math.ceil(Math.random()*4)
    
    for (let i = randomNum; i > 0; i--) {
      let eggRandom = Math.floor(Math.random() * eggMoves.length)
      preMoveSet.push(eggMoves[eggRandom])
    }

    let moveSetData = []

    if (preMoveSet[0]) {
      const move0 = await axios.get(`${preMoveSet[0].move.url}`)
      moveSetData.push(move0.data)
    }
    if (preMoveSet[1]) {
      const move1 = await axios.get(`${preMoveSet[1].move.url}`)
      moveSetData.push(move1.data)
    }
    if (preMoveSet[2]) {
      const move2 = await axios.get(`${preMoveSet[2].move.url}`)
      moveSetData.push(move2.data)
    }
    if (preMoveSet[3]) {
      const move3 = await axios.get(`${preMoveSet[3].move.url}`)
      moveSetData.push(move3.data)
    }
    
    let moveSet = []

    moveSetData.forEach(move => {
      moveSet.push({
        name: `${move.name}`,
        type: `${move.type.name}`,
        accuracy: move.accuracy,
        effect: `${move.effect_entries[0].short_effect}`,
        effectChance: move.effect_chance,
        damageClass: `${move.damage_class.name}`,
        totalPP: move.pp,
        currentPP: move.pp,
        power: move.power,
        priority: move.priority,
      })
    })

    let typeSet = []

    foundPokemon.data.types.forEach(type => {
      typeSet.push({
        slot: type.slot,
        name: `${type.type.name}`
      })
    })

    let stats = []

    foundPokemon.data.stats.forEach(stat => {
      stats.push({
        name: `${stat.stat.name}`,
        baseStat: stat.base_stat,
        effort: stat.effort,
      })
    })

    const generatedPokemon = {
      name: foundPokemon.data.name,
      level: req.body.level,
      types: typeSet,
      pokedexNum: foundPokemon.data.id,
      potentialMoves: potMoves,
      moveSet: moveSet,
      spriteFront: `${foundPokemon.data.sprites.front_default}`,
      spriteBack: `${foundPokemon.data.sprites.back_default}`,
      stats: stats
    }


    res.status(200).json(generatedPokemon)
  } catch (error) {
    res.status(500).json(error)
  }
}


export {
  findPokemon,
  findMove,
  generatePokemon,
}