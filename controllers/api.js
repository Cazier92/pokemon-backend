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
    let pokemonLevel

    if (!Number(req.params.level) || Number(req.params.level) > 100 || Number(req.params.level) < 1) {
      pokemonLevel = 5
    } else {
      pokemonLevel = Number(req.params.level)
    }




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
    foundPokemon.data.moves.forEach(move => {
      if (move.version_group_details[0].move_learn_method.name === 'machine' && move.version_group_details[0].level_learned_at <= pokemonLevel) {
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

    moveSet.forEach(move => {
      if (move.effect.includes('$')) {
        move.effect = (move.effect.replace('$effect_chance', `${move.effectChance}`))
      }
    })

    let typeSet = []

    foundPokemon.data.types.forEach(type => {
      typeSet.push({
        slot: type.slot,
        name: `${type.type.name}`
      })
    })

    let stats = []

    let hp, attack, spAttack, defense, spDefense, speed

    foundPokemon.data.stats.forEach(stat => {
      let randomNumIV = Math.floor(Math.random() * 32)
      stats.push({
        name: `${stat.stat.name}`,
        baseStat: stat.base_stat,
        effort: stat.effort,
        iv: randomNumIV,
        effortPoints: 0,
      })
      if (stat.stat.name === 'hp') {
        hp = ((((2 * stat.base_stat + randomNumIV) * pokemonLevel)/ 100) + pokemonLevel + 10)
      } 
      else if (stat.stat.name === 'attack') {
        attack = ((((2 * stat.base_stat + randomNumIV) * pokemonLevel)/100) + 5)
      }
      else if (stat.stat.name === 'defense') {
        defense = ((((2 * stat.base_stat + randomNumIV) * pokemonLevel)/100) + 5)
      }
      else if (stat.stat.name === 'special-defense') {
        spDefense = ((((2 * stat.base_stat + randomNumIV) * pokemonLevel)/100) + 5)
      }
      else if (stat.stat.name === 'special-attack') {
        spAttack = ((((2 * stat.base_stat + randomNumIV) * pokemonLevel)/100) + 5)
      }
      else if (stat.stat.name === 'speed') {
        speed = ((((2 * stat.base_stat + randomNumIV) * pokemonLevel)/100) + 5)
      }
    })



    const speciesData = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${req.params.num}`)

    const evolutionChainData = await axios.get(`${speciesData.data.evolution_chain.url}`)

    let evolves = false
    let evolvesTo = []

    if (evolutionChainData.data.chain.species.name === foundPokemon.data.name){
      if (evolutionChainData.data.chain.evolves_to.length > 1) {
        console.log('hello')
        evolutionChainData.data.chain.evolves_to.forEach(evolution => {
          if (evolution.evolution_details[0].item !== null) {
            evolvesTo.push({
              name: `${evolution.species.name}`,
              trigger: evolution.evolution_details[0].trigger.name,
              minLevel: evolution.evolution_details[0].min_level,
              item: `${evolution.evolution_details[0].item.name}`
            })
          } else {
            evolvesTo.push({
              name: `${evolution.species.name}`,
              trigger: evolution.evolution_details[0].trigger.name,
              minLevel: evolution.evolution_details[0].min_level,
              item: null
            })
          }
        })
      } else {
        if (evolutionChainData.data.chain.evolves_to.length && evolutionChainData.data.chain.evolves_to[0].evolution_details[0].item !== null) {
          evolves = true
          evolvesTo.push({
            name: `${evolutionChainData.data.chain.evolves_to[0].species.name}`,
            trigger: `${evolutionChainData.data.chain.evolves_to[0].evolution_details[0].trigger.name}`,
            minLevel: evolutionChainData.data.chain.evolves_to[0].evolution_details[0].min_level,
            item: `${evolutionChainData.data.chain.evolves_to[0].evolution_details[0].item.name}`
          })
        } else if (evolutionChainData.data.chain.evolves_to.length) {
          evolves = true
          evolvesTo.push({
            name: `${evolutionChainData.data.chain.evolves_to[0].species.name}`,
            trigger: `${evolutionChainData.data.chain.evolves_to[0].evolution_details[0].trigger.name}`,
            minLevel: evolutionChainData.data.chain.evolves_to[0].evolution_details[0].min_level,
            item: null
          })
        }
        else if (evolutionChainData.data.chain.evolves_to[0].species.name === foundPokemon.data.name && evolutionChainData.data.chain.evolves_to[0].evolves_to.length) {
          if (evolutionChainData.data.chain.evolves_to[0].evolves_to[0].evolution_details[0].item.name !== null) {
            evolves = true
            evolvesTo.push(
              {
                name: `${evolutionChainData.data.chain.evolves_to[0].evolves_to[0].species.name}`,
                trigger: `${evolutionChainData.data.chain.evolves_to[0].evolves_to[0].evolution_details[0].trigger.name}`,
                minLevel: evolutionChainData.data.chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level,
                item: `${evolutionChainData.data.chain.evolves_to[0].evolves_to[0].evolution_details[0].item.name}`
            }
            ) 
          } else {
            evolves = true
            evolvesTo.push({
              name: `${evolutionChainData.data.chain.evolves_to[0].evolves_to[0].species.name}`,
              trigger: `${evolutionChainData.data.chain.evolves_to[0].evolves_to[0].evolution_details[0].trigger.name}`,
              minLevel: evolutionChainData.data.chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level,
          })
          }
        }

      }
    } 




    const generatedPokemon = {
      name: foundPokemon.data.name,
      level: pokemonLevel,
      types: typeSet,
      pokedexNum: foundPokemon.data.id,
      potentialMoves: potMoves,
      moveSet: moveSet,
      spriteFront: `${foundPokemon.data.sprites.front_default}`,
      spriteBack: `${foundPokemon.data.sprites.back_default}`,
      stats: stats,
      evolves: evolves,
      evolvesTo: evolvesTo,
      totalHP: hp,
      currentHP: hp,
      attack: attack,
      spAttack: spAttack,
      defense: defense,
      spDefense: spDefense,
      speed: speed,
      effortPointTotal: 0,
      statusCondition: null,
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