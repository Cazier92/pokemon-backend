import axios from "axios";
import { Pokemon } from "../models/pokemon.js";
import { Move } from "../models/move.js";


const findPokemon = async (req, res) => {
  try {
    const pokemon = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.params.name}`)
    console.log(typeof pokemon.data.name)
    res.status(200).json(pokemon.data.name)
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
    const pokemonExists = await Pokemon.findOne({pokedexNum: req.params.num})

    
    if (pokemonExists) {
      console.log('Pokemon Exists')
      let pokemonLevel
  
      if (!Number(req.params.level) || Number(req.params.level) > 100 || Number(req.params.level) < 1) {
        pokemonLevel = 5
      } else {
        pokemonLevel = Number(req.params.level)
      }
      let stats = []
  
      let hp, attack, spAttack, defense, spDefense, speed
  
      pokemonExists.stats.forEach(stat => {
        let randomNumIV = Math.floor(Math.random() * 32)
        stats.push({
          name: `${stat.name}`,
          baseStat: stat.baseStat,
          effort: stat.effort,
          iV: randomNumIV,
          effortPoints: 0,
        })
        if (stat.name === 'hp') {
          hp = ((((2 * stat.baseStat + randomNumIV) * pokemonLevel)/ 100) + pokemonLevel + 10)
        } 
        else if (stat.name === 'attack') {
          attack = ((((2 * stat.baseStat + randomNumIV) * pokemonLevel)/100) + 5)
        }
        else if (stat.name === 'defense') {
          defense = ((((2 * stat.baseStat + randomNumIV) * pokemonLevel)/100) + 5)
        }
        else if (stat.name === 'special-defense') {
          spDefense = ((((2 * stat.baseStat + randomNumIV) * pokemonLevel)/100) + 5)
        }
        else if (stat.name === 'special-attack') {
          spAttack = ((((2 * stat.baseStat + randomNumIV) * pokemonLevel)/100) + 5)
        }
        else if (stat.name === 'speed') {
          speed = ((((2 * stat.baseStat + randomNumIV) * pokemonLevel)/100) + 5)
        }
      })


      let eggMoves = []
      
      pokemonExists.potentialMoves.forEach(move => {
        if (move.method === 'egg') {
          eggMoves.push(move)
        }
      })
      pokemonExists.potentialMoves.forEach(move => {
        if (move.method !== 'machine' && move.level <= pokemonLevel) {
          eggMoves.push(move)
        }
      })

  
      let preMoveSet = []
  
      let randomNum = Math.ceil(Math.random()*4)
      
      // for (let i = randomNum; i > 0; i--) {
      //   let eggRandom = Math.floor(Math.random() * eggMoves.length)
      //   preMoveSet.push(eggMoves[eggRandom])
      // }

      const findMoves = (num) => {
        if (num > 0) {
          let eggRandom = Math.floor(Math.random() * eggMoves.length)
          const move = eggMoves[eggRandom]
          if (num === randomNum) {
            if (move.power !== null) {
              preMoveSet.push(eggMoves[eggRandom])
              let newNum = num -1
              findMoves(newNum)
            } else {
              findMoves(num)
            }
          } else {
            preMoveSet.push(eggMoves[eggRandom])
            let newNum = num -1
            findMoves(newNum)
          }
        }
      }

      findMoves(randomNum)
  
      let moveSetData = []
      let moveSet = []

  
      if (preMoveSet[0]) {
        const dataBaseMove0 = await Move.findOne({ name: preMoveSet[0].name })
        if (dataBaseMove0) {
          moveSet.push(dataBaseMove0)
        } else {
          const move0 = await axios.get(`${preMoveSet[0].url}`)
          moveSetData.push(move0.data)
        }
      }
      if (preMoveSet[1]) {
        const dataBaseMove1 = await Move.findOne({ name: preMoveSet[1].name })
        if (dataBaseMove1) {
          moveSet.push(dataBaseMove1)
        } else {
          const move1 = await axios.get(`${preMoveSet[1].url}`)
          moveSetData.push(move1.data)
        }
      }
      if (preMoveSet[2]) {
        const dataBaseMove2 = await Move.findOne({ name: preMoveSet[2].name })
        if (dataBaseMove2) {
          console.log(dataBaseMove2)
          moveSet.push(dataBaseMove2)
        } else {
          const move2 = await axios.get(`${preMoveSet[2].url}`)
          moveSetData.push(move2.data)
        }
      }
      if (preMoveSet[3]) {
        const dataBaseMove3 = await Move.findOne({ name: preMoveSet[3].name })
        if (dataBaseMove3) {
          console.log(dataBaseMove3)
          moveSet.push(dataBaseMove3)
        } else {
          const move3 = await axios.get(`${preMoveSet[3].url}`)
          moveSetData.push(move3.data)
        }
      }

      for(let i = 0; i < moveSetData.length; i++) {
        let effect = moveSetData[i].effect_entries[0].short_effect
        if (effect.includes('$')) {
          effect = (effect.replace('$effect_chance', `${moveSetData[i].effect_chance}`))
        }
        const newMove = await Move.create({
          name: `${moveSetData[i].name}`,
          type: `${moveSetData[i].type.name}`,
          accuracy: moveSetData[i].accuracy,
          effect: `${effect}`,
          effectChance: moveSetData[i].effect_chance,
          damageClass: `${moveSetData[i].damage_class.name}`,
          totalPP: moveSetData[i].pp,
          currentPP: moveSetData[i].pp,
          power: moveSetData[i].power,
          priority: moveSetData[i].priority,
        })
        moveSet.push(newMove)
      }

      let growthRate = pokemonExists.growthRate

      let currentExp
  
      let nextLevelExp

  
      if (growthRate === 'fast') {
        currentExp = 4*(pokemonLevel**3)
        nextLevelExp = 4*((pokemonLevel + 1)**3)
      } 
      else if (growthRate === 'medium-fast') {
        currentExp = (pokemonLevel**3)
        nextLevelExp = ((pokemonLevel + 1)**3)
      } 
      else if (growthRate === 'slow') {
        currentExp = ((5 * (pokemonLevel **3)) / 4)
        nextLevelExp = ((5 * ((pokemonLevel + 1) **3)) / 4)
      } 
      else if (growthRate === 'medium-slow') {
        currentExp = ((6/5) * pokemonLevel**3) - (15 * pokemonLevel ** 2) + (100 * pokemonLevel) - 140
        nextLevelExp = ((6/5) * ((pokemonLevel + 1)**3)) - (15 * (pokemonLevel + 1) ** 2) + (100 * (pokemonLevel + 1)) - 140
      } 
      else if (growthRate === 'fluctuating') {
        if (pokemonLevel + 1 < 15) {
          currentExp = (((pokemonLevel **3) * (((pokemonLevel + 1)/3) +24)) /50)
          nextLevelExp = ((((pokemonLevel + 1) **3) * ((((pokemonLevel + 1) + 1)/3) +24)) /50)
        } else if (pokemonLevel + 1 <=15 && pokemonLevel + 1 < 36) {
          currentExp = (((pokemonLevel ** 3)*(pokemonLevel + 14))/50)
          nextLevelExp = ((((pokemonLevel + 1) ** 3)*((pokemonLevel + 1) + 14))/50)
        } else {
          currentExp = (((pokemonLevel **3) * ((pokemonLevel / 2) + 32))/50)
          nextLevelExp = ((((pokemonLevel + 1) **3) * (((pokemonLevel + 1) / 2) + 32))/50)
        }
      }
      else {
        if (pokemonLevel + 1 < 50) {
          currentExp = (pokemonLevel**3 * (100 - pokemonLevel) / 50)
          nextLevelExp = ((pokemonLevel + 1)**3 * (100 - (pokemonLevel + 1)) / 50)
        } else if (pokemonLevel + 1 <= 50 && pokemonLevel + 1 < 68) {
          currentExp = (pokemonLevel**3 * (150 - pokemonLevel) / 100)
          nextLevelExp = ((pokemonLevel + 1)**3 * (150 - (pokemonLevel + 1)) / 100)
        } else if (pokemonLevel + 1 <= 68 && pokemonLevel + 1 < 98) {
          currentExp = ((pokemonLevel**3 * (1911 - pokemonLevel*10) / 3) / 500)
          nextLevelExp = (((pokemonLevel + 1)**3 * (1911 - (pokemonLevel + 1)*10) / 3) / 500)
        } else {
          currentExp = ((pokemonLevel**3 * (160 - pokemonLevel)) / 100)
          nextLevelExp = (((pokemonLevel + 1)**3 * (160 - (pokemonLevel + 1))) / 100)
        }
      }
  
      currentExp = Math.floor(currentExp)
      nextLevelExp = Math.floor(nextLevelExp)

  
      if (pokemonLevel === 100) {
        nextLevelExp = NaN
      }
  
      let levelBaseExp = currentExp
  
      let percentToNextLevel
  
      if (pokemonLevel < 100 && currentExp > levelBaseExp) {
        percentToNextLevel = (nextLevelExp - (currentExp))/(nextLevelExp - levelBaseExp)
      } else {
        percentToNextLevel = 0
      } 

      const generatedPokemon = {
        name: pokemonExists.name,
        owner: null,
        originalOwner: null,
        level: pokemonLevel,
        types: pokemonExists.types,
        pokedexNum: pokemonExists.pokedexNum,
        potentialMoves: pokemonExists.potentialMoves,
        moveSet: moveSet,
        spriteFront: pokemonExists.spriteFront,
        spriteBack: pokemonExists.spriteBack,
        stats: stats,
        evolves: pokemonExists.evolves,
        evolvesTo: pokemonExists.evolvesTo,
        totalHP: hp,
        currentHP: hp,
        attack: attack,
        spAttack: spAttack,
        defense: defense,
        spDefense: spDefense,
        speed: speed,
        effortPointTotal: 0,
        captureRate: pokemonExists.captureRate,
        growthRate: growthRate,
        levelBaseExp: levelBaseExp,
        currentExp: currentExp,
        percentToNextLevel: percentToNextLevel,
        nextLevelExp: nextLevelExp,
        baseExpYield: pokemonExists.baseExpYield,
      }

      const newPokemon = await Pokemon.create(generatedPokemon)
      // .populate('moveSet')
      res.status(200).json(newPokemon)
    } else {
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
        if (move.version_group_details[0].move_learn_method.name !== 'machine' && move.version_group_details[0].level_learned_at <= pokemonLevel) {
          eggMoves.push(move)
        }
      })
  

      let preMoveSet = []
      
  
      let randomNum = Math.ceil(Math.random()*4)
      
      // for (let i = randomNum; i > 0; i--) {
      //   let eggRandom = Math.floor(Math.random() * eggMoves.length)
      //   preMoveSet.push(eggMoves[eggRandom])
      // }

      const findMoves = (num) => {
        if (num > 0) {
          let eggRandom = Math.floor(Math.random() * eggMoves.length)
          const move = eggMoves[eggRandom]
          if (num === randomNum) {
            if (move.power !== null) {
              preMoveSet.push(eggMoves[eggRandom])
              let newNum = num -1
              findMoves(newNum)
            } else {
              findMoves(num)
            }
          } else {
            preMoveSet.push(eggMoves[eggRandom])
            let newNum = num -1
            findMoves(newNum)
          }
        }
      }

      findMoves(randomNum)
  
      let moveSetData = []

      let moveSet = []
  
      if (preMoveSet[0]) {
        const dataBaseMove0 = await Move.findOne({ name: preMoveSet[0].name })
        if (dataBaseMove0) {
          console.log(dataBaseMove0)
          moveSet.push(dataBaseMove0)
        } else {
          // console.log(eggMoves[0])
          console.log(preMoveSet[0])
          const move0 = await axios.get(`${preMoveSet[0].move.url}`)
          moveSetData.push(move0.data)
        }
      }
      if (preMoveSet[1]) {
        const dataBaseMove1 = await Move.findOne({ name: preMoveSet[1].name })
        if (dataBaseMove1) {
          console.log(dataBaseMove1)
          moveSet.push(dataBaseMove1)
        } else {
          const move1 = await axios.get(`${preMoveSet[1].move.url}`)
          moveSetData.push(move1.data)
        }
      }
      if (preMoveSet[2]) {
        const dataBaseMove2 = await Move.findOne({ name: preMoveSet[2].name })
        if (dataBaseMove2) {
          console.log(dataBaseMove2)
          moveSet.push(dataBaseMove2)
        } else {
          const move2 = await axios.get(`${preMoveSet[2].move.url}`)
          moveSetData.push(move2.data)
        }
      }
      if (preMoveSet[3]) {
        const dataBaseMove3 = await Move.findOne({ name: preMoveSet[3].name })
        if (dataBaseMove3) {
          console.log(dataBaseMove3)
          moveSet.push(dataBaseMove3)
        } else {
          const move3 = await axios.get(`${preMoveSet[3].move.url}`)
          moveSetData.push(move3.data)
        }
      }

      for(let i = 0; i < moveSetData.length; i++) {
        let effect = moveSetData[i].effect_entries[0].short_effect
        if (effect.includes('$')) {
          effect = (effect.replace('$effect_chance', `${moveSetData[i].effect_chance}`))
        }
        const newMove = await Move.create({
          name: `${moveSetData[i].name}`,
          type: `${moveSetData[i].type.name}`,
          accuracy: moveSetData[i].accuracy,
          effect: `${effect}`,
          effectChance: moveSetData[i].effect_chance,
          damageClass: `${moveSetData[i].damage_class.name}`,
          totalPP: moveSetData[i].pp,
          currentPP: moveSetData[i].pp,
          power: moveSetData[i].power,
          priority: moveSetData[i].priority,
        })
        moveSet.push(newMove)
      }
  
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
          iV: randomNumIV,
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
  
      let captureRate = speciesData.data.capture_rate
      let growthRate = speciesData.data.growth_rate.name
  
  
      const evolutionChainData = await axios.get(`${speciesData.data.evolution_chain.url}`)
  
      let evolves = false
      let evolvesTo = []
  
      if (evolutionChainData.data.chain.species.name === foundPokemon.data.name){
  
        if (evolutionChainData.data.chain.evolves_to.length > 1) {
  
          evolutionChainData.data.chain.evolves_to.forEach(evolution => {
  
            evolution.evolution_details.forEach(evolutionType => {
              if (evolutionType.item !== null) {
                evolves = true
                evolvesTo.push({
                  name: `${evolution.species.name}`,
                  trigger: evolutionType.trigger.name,
                  minLevel: evolutionType.min_level,
                  item: `${evolutionType.item.name}`
                })
  
              } else if (evolutionType.held_item !== null) {
                evolves = true
                evolvesTo.push({
                  name: `${evolution.species.name}`,
                  trigger: evolutionType.trigger.name,
                  minLevel: evolutionType.min_level,
                  heldItem: `${evolutionType.held_item.name}`
                })
              }
              else {
                evolves = true
                evolvesTo.push({
                  name: `${evolution.species.name}`,
                  trigger: evolutionType.trigger.name,
                  minLevel: evolutionType.min_level,
                  item: null
                })
  
              }
            })
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
          } else if (evolutionChainData.data.chain.evolves_to.length && evolutionChainData.data.chain.evolves_to[0].evolution_details[0].held_item !== null) {
            evolves = true
            evolvesTo.push({
              name: `${evolutionChainData.data.chain.evolves_to[0].species.name}`,
              trigger: `${evolutionChainData.data.chain.evolves_to[0].evolution_details[0].trigger.name}`,
              minLevel: evolutionChainData.data.chain.evolves_to[0].evolution_details[0].min_level,
              heldItem: `${evolutionChainData.data.chain.evolves_to[0].evolution_details[0].held_item.name}`
            })
          }
          else if (evolutionChainData.data.chain.evolves_to.length) {
            evolves = true
            evolvesTo.push({
              name: `${evolutionChainData.data.chain.evolves_to[0].species.name}`,
              trigger: `${evolutionChainData.data.chain.evolves_to[0].evolution_details[0].trigger.name}`,
              minLevel: evolutionChainData.data.chain.evolves_to[0].evolution_details[0].min_level,
              item: null
            })
          }
        }
  
      } else if (evolutionChainData.data.chain.evolves_to[0].species.name === foundPokemon.data.name && evolutionChainData.data.chain.evolves_to[0].evolves_to.length) {
        if (evolutionChainData.data.chain.evolves_to[0].evolves_to[0].evolution_details[0].item !== null) {
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
  
      let currentExp
  
      let nextLevelExp

      console.log(((6/5) * (pokemonLevel + 1)**3) - (15 * (pokemonLevel + 1) ** 2) + (100 * (pokemonLevel + 1)) - 140)
  
      if (growthRate === 'fast') {
        currentExp = 4*(pokemonLevel**3)
        nextLevelExp = 4*((pokemonLevel + 1)**3)
      } 
      else if (growthRate === 'medium-fast') {
        currentExp = (pokemonLevel**3)
        nextLevelExp = ((pokemonLevel + 1)**3)
      } 
      else if (growthRate === 'slow') {
        currentExp = ((5 * (pokemonLevel **3)) / 4)
        nextLevelExp = ((5 * ((pokemonLevel + 1) **3)) / 4)
      } 
      else if (growthRate === 'medium-slow') {
        currentExp = ((6/5) * pokemonLevel**3) - (15 * pokemonLevel ** 2) + (100 * pokemonLevel) - 140
        nextLevelExp = ((6/5) * (pokemonLevel + 1)**3) - (15 * (pokemonLevel + 1) ** 2) + (100 * (pokemonLevel + 1)) - 140
      } 
      else if (growthRate === 'fluctuating') {
        if (pokemonLevel + 1 < 15) {
          currentExp = (((pokemonLevel **3) * (((pokemonLevel + 1)/3) +24)) /50)
          nextLevelExp = ((((pokemonLevel + 1) **3) * ((((pokemonLevel + 1) + 1)/3) +24)) /50)
        } else if (pokemonLevel + 1 <=15 && pokemonLevel + 1 < 36) {
          currentExp = (((pokemonLevel ** 3)*(pokemonLevel + 14))/50)
          nextLevelExp = ((((pokemonLevel + 1) ** 3)*((pokemonLevel + 1) + 14))/50)
        } else {
          currentExp = (((pokemonLevel **3) * ((pokemonLevel / 2) + 32))/50)
          nextLevelExp = ((((pokemonLevel + 1) **3) * (((pokemonLevel + 1) / 2) + 32))/50)
        }
      }
      else {
        if (pokemonLevel + 1 < 50) {
          currentExp = (pokemonLevel**3 * (100 - pokemonLevel) / 50)
          nextLevelExp = ((pokemonLevel + 1)**3 * (100 - (pokemonLevel + 1)) / 50)
        } else if (pokemonLevel + 1 <= 50 && pokemonLevel + 1 < 68) {
          currentExp = (pokemonLevel**3 * (150 - pokemonLevel) / 100)
          nextLevelExp = ((pokemonLevel + 1)**3 * (150 - (pokemonLevel + 1)) / 100)
        } else if (pokemonLevel + 1 <= 68 && pokemonLevel + 1 < 98) {
          currentExp = ((pokemonLevel**3 * (1911 - pokemonLevel*10) / 3) / 500)
          nextLevelExp = (((pokemonLevel + 1)**3 * (1911 - (pokemonLevel + 1)*10) / 3) / 500)
        } else {
          currentExp = ((pokemonLevel**3 * (160 - pokemonLevel)) / 100)
          nextLevelExp = (((pokemonLevel + 1)**3 * (160 - (pokemonLevel + 1))) / 100)
        }
      }
  
      currentExp = Math.floor(currentExp)
      nextLevelExp = Math.floor(nextLevelExp)

  
      if (pokemonLevel === 100) {
        nextLevelExp = NaN
      }
  
      let levelBaseExp = currentExp
  
      let percentToNextLevel
  
      if (pokemonLevel < 100 && currentExp > levelBaseExp) {
        percentToNextLevel = (nextLevelExp - (currentExp))/(nextLevelExp - levelBaseExp)
      } else {
        percentToNextLevel = 0
      } 
  
  
  
  
      const generatedPokemon = {
        name: foundPokemon.data.name,
        owner: null,
        originalOwner: null,
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
        captureRate: captureRate,
        growthRate: growthRate,
        levelBaseExp: levelBaseExp,
        currentExp: currentExp,
        percentToNextLevel: percentToNextLevel,
        nextLevelExp: nextLevelExp,
        baseExpYield: foundPokemon.data.base_experience,
        holdItem: null,
      }
      
      const newPokemon = await Pokemon.create(generatedPokemon)
      // .populate('moveSet')
      console.log(newPokemon)
      res.status(200).json(newPokemon)

    }

  } catch (error) {
    res.status(500).json(error)
  }
}


export {
  findPokemon,
  findMove,
  generatePokemon,
}