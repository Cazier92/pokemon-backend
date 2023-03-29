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

const levelUpPokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id)

    if (pokemon.currentExp >= pokemon.nextLevelExp) {
      let LevelUpForm
      let hp, attack, spAttack, defense, spDefense, speed

      const pokemonLevel = pokemon.level + 1

      pokemon.stats.forEach(stat => {
        if (stat.name === 'hp') {
          hp = ((((2 * stat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/ 100) + pokemonLevel + 10)
        } 
        else if (stat.name === 'attack') {
          attack = ((((2 * stat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
        }
        else if (stat.name === 'defense') {
          defense = ((((2 * stat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
        }
        else if (stat.name === 'special-defense') {
          spDefense = ((((2 * stat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
        }
        else if (stat.name === 'special-attack') {
          spAttack = ((((2 * stat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
        }
        else if (stat.name === 'speed') {
          speed = ((((2 * stat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
        }
      })
      
    } else {
      res.status(200).json(pokemon)
    }
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
        if (evolution.trigger === 'level-up' && evolution.minLevel !== null && pokemon.level >= evolution.minLevel) {
          evolvePokemon = evolution.name
        } else if (evolution.trigger === 'level-up' && evolution.minLevel === null && pokemon.level >= 32) {
          evolvePokemon = evolution.name
        }
      })
    }

    const evolutionPokemonData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${evolvePokemon}`)

    const eData = evolutionPokemonData.data

    const speciesData = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${evolvePokemon}`)

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

            } else {
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

    let evolveStats = []
    let hp, attack, spAttack, defense, spDefense, speed
    const pokemonLevel = pokemon.level

    eData.stats.forEach(eStat => {
      pokemon.stats.forEach(stat => {
        if (eStat.stat.name === stat.name) {
          evolveStats.push({
            name: stat.name,
            baseStat: eStat.base_stat,
            effort: eStat.effort,
            iV: stat.iV,
            effortPoints: stat.effortPoints
          })
          if (eStat.name === 'hp') {
            hp = ((((2 * eStat.base_stat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/ 100) + pokemonLevel + 10)
          } 
          else if (eStat.name === 'attack') {
            attack = ((((2 * eStat.base_stat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
          }
          else if (eStat.name === 'defense') {
            defense = ((((2 * eStat.base_stat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
          }
          else if (eStat.name === 'special-defense') {
            spDefense = ((((2 * eStat.base_stat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
          }
          else if (eStat.name === 'special-attack') {
            spAttack = ((((2 * eStat.base_stat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
          }
          else if (eStat.name === 'speed') {
            speed = ((((2 * eStat.base_stat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
          }
        }
      })
    })

    let potMoves = []

    eData.moves.forEach(move => {
      potMoves.push(
        {
          name: `${move.move.name}`,
          url: `${move.move.url}`,
          level: move.version_group_details[0].level_learned_at,
          method: `${move.version_group_details[0].move_learn_method.name}`,
        }
      )
    })

    let typeSet = []

    eData.types.forEach(type => {
      typeSet.push({
        slot: type.slot,
        name: `${type.type.name}`
      })
    })

    let growthRate = speciesData.data.growth_rate.name

    const evolutionForm = {
      name: eData.name,
      pokedexNum: eData.id,
      types: typeSet,
      spriteFront: eData.sprites.front_default,
      spriteBack: eData.sprites.back_default,
      evolves: evolves,
      evolvesTo: evolvesTo,
      stats: evolveStats,
      potentialMoves: potMoves,
      growthRate: growthRate,
      totalHP: hp,
      attack: attack,
      defense: defense,
      spAttack: spAttack,
      spDefense: spDefense,
      speed: speed
    }

    const evolvedPokemon = Pokemon.findByIdAndUpdate(
      req.params.id,
      evolutionForm,
      { new: true }
    ).populate('owner')

    res.status(200).json(evolvedPokemon)
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}


export { 
  create,
  updatePokemon,
  levelUpPokemon,
  evolvePokemon,
}