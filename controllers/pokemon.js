import { Pokemon } from '../models/pokemon.js'
import { Profile } from '../models/profile.js'
import { Move } from '../models/move.js'
import axios from 'axios'
import * as algorithms from '../data/algorithms.js'

const create = async (req, res) => {
  try {
    req.body.owner = req.user.profile
    req.body.originalOwner = req.user.profile
    console.log(req.user)
    const pokemon = await Pokemon.create(req.body)
    res.status(201).json(pokemon)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const index = async (req, res) => {
  try {
    const allPokemon = await Pokemon.find({})
    .populate('owner', 'originalOwner')
    res.status(200).json(allPokemon)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const show = async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id)
    .populate('moveSet')
    res.status(200).json(pokemon)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const showParty = async (req, res) => {
  try {
    const profile = await Profile.findById(req.user.profile)
    let partyPokemon = []
    for (let i = 0; i < profile.party.length; i++) {
      const pokemon = await Pokemon.findById(profile.party[i])
      partyPokemon.push(pokemon)
    }
    res.status(200).json(partyPokemon)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const updatePokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('owner')
    res.status(200).json(pokemon)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const addPokemonToParty = async (req, res) => {
  try {
    const user = await Profile.findById(req.params.userId)
    const pokemon = await Pokemon.findByIdAndUpdate(
      req.params.pokemonId,
      { owner: user, originalOwner: user },
      { new: true }
    )
    const profile = await Profile.findByIdAndUpdate(
      req.user.profile,
      { $push: { party: pokemon }},
      { new: true }
    ).populate('party')

    res.status(201).json(profile)
  } catch (error) {
    console.log(err)
    res.status(500).json(err)
  }
}

const addPokemonToPC = async (req, res) => {
  try {
    const user = await Profile.findById(req.params.userId)
    const pokemon = await Pokemon.findByIdAndUpdate(
      req.params.pokemonId,
      { owner: user, originalOwner: user },
      { new: true }
    )
    const profile = await Profile.findByIdAndUpdate(
      req.user.profile,
      { $push: { pokemonPC: pokemon }},
      { new: true }
    )

    res.status(201).json(profile)
  } catch (error) {
    console.log(err)
    res.status(500).json(err)
  }
}

const deletePokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id)
    if (pokemon.owner !== null && pokemon.owner === req.user.profile) {
      const deletedPokemon = await Pokemon.findByIdAndDelete(req.params.id)
      const profile = await Profile.findById(req.user.profile)
      profile.party.remove({ _id: req.params.id })
      profile.pokemonPC.remove({ _id: req.params.id })
      await profile.save()
      res.status(200).json(deletedPokemon)
    } else if (!pokemon.owner) {
      const deletedPokemon = await Pokemon.findByIdAndDelete(req.params.id)
      res.status(200).json(deletedPokemon)
    } else {
      res.status(401).json("NOT AUTHORIZED: Cannot delete other user's Pokémon!")
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const expGain = async (req, res) => {
  try {
    const faintedPokemon = req.body.faintedPokemon
    const pokemon = await Pokemon.findById(req.params.id)
    const exp = req.body.exp
    const winner = req.body.winner

    let effortPointTotal = pokemon.effortPointTotal

    let effortGains = []

    let newStats = []

    const newExp = exp + pokemon.currentExp



    if (`${pokemon._id}` === winner) {
      faintedPokemon.stats.forEach(stat => {
        // if (stat.effort > 0) {
          effortGains.push(stat)
        // }
      })
  
      if (effortPointTotal < 510) {
        pokemon.stats.forEach(stat => {
          if (stat.effortPoints < 255) {
            effortGains.forEach(gain => {
              if (gain.name === stat.name) {
                if (stat.effortPoints + gain.effort <= 255 && effortPointTotal + gain.effort <= 510) {
                  newStats.push({
                    name: stat.name,
                    baseStat: stat.baseStat,
                    effort: stat.effort,
                    iV: stat.iV,
                    effortPoints: (stat.effortPoints + gain.effort)
                  })
                  effortPointTotal = (effortPointTotal + gain.effort)
                } else if (stat.effortPoints + gain.effort > 255 && effortPointTotal + gain.effort <= 510 && stat.effortPoints < 255) {
                  newStats.push({
                    name: stat.name,
                    baseStat: stat.baseStat,
                    effort: stat.effort,
                    iV: stat.iV,
                    effortPoints: 255
                  })
                  effortPointTotal = (effortPointTotal + gain.effort)
                } else if (stat.effortPoints + gain.effort <= 255 && effortPointTotal + gain.effort > 510 && stat.effortPoints < 255) {
                  const difference = 510 - effortPointTotal
                  newStats.push({
                    name: stat.name,
                    baseStat: stat.baseStat,
                    effort: stat.effort,
                    iV: stat.iV,
                    effortPoints: (stat.effortPoints + difference)
                  })
                  effortPointTotal = 510
                } else if (stat.effortPoints + gain.effort > 255 && effortPointTotal + gain.effort > 510 && stat.effortPoints < 255) {
                  newStats.push({
                    name: stat.name,
                    baseStat: stat.baseStat,
                    effort: stat.effort,
                    iV: stat.iV,
                    effortPoints: 255
                  })
                  effortPointTotal = 510
                }
              }
            })
          } else {
            newStats.push(stat)
          }
        })
  
      } else {
        newStats = pokemon.stats
      }

    } else {
      newStats = pokemon.stats
    }

    let percentToNextLevel

    let pokemonLevel = pokemon.level
    let levelBaseExp = pokemon.levelBaseExp
    let nextLevelExp = pokemon.nextLevelExp
  
    if (pokemonLevel < 100 && newExp > levelBaseExp) {
      percentToNextLevel = (nextLevelExp - (newExp))/(nextLevelExp - levelBaseExp)
    } else {
      percentToNextLevel = 0
    } 

    const updateForm = {
      stats: newStats,
      currentExp: newExp,
      effortPointTotal: effortPointTotal,
      percentToNextLevel: percentToNextLevel
    }

    const updatedPokemon = await Pokemon.findByIdAndUpdate(
      req.params.id,
      updateForm,
      {new: true}
    ).populate('owner')

    res.status(200).json(updatedPokemon)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const levelUpPokemon = async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id)

    if (pokemon.level < 100) {
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
  
        console.log('hp', hp)
        console.log('currentHP', pokemon.currentHP)
        console.log('totalHP', pokemon.totalHP)
  
        let currentHP = (pokemon.currentHP/ pokemon.totalHP) * hp
  
        let levelBaseExp
        let currentExp
        let growthRate = pokemon.growthRate
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
    
        levelBaseExp = currentExp
    
        let percentToNextLevel
    
        if (pokemonLevel < 100 && pokemon.currentExp > levelBaseExp) {
          percentToNextLevel = (nextLevelExp - (pokemon.currentExp))/(nextLevelExp - levelBaseExp)
        } else {
          percentToNextLevel = 0
        } 
  
        const levelUpForm = {
          level: pokemonLevel,
          totalHp: hp,
          currentHP: currentHP,
          attack: attack,
          spAttack: spAttack,
          defense: defense,
          spDefense: spDefense,
          speed: speed,
          percentToNextLevel: percentToNextLevel,
          nextLevelExp: nextLevelExp,
          levelBaseExp: levelBaseExp,
        }
  
        const leveledUpPokemon = await Pokemon.findByIdAndUpdate(
          req.params.id,
          levelUpForm,
          { new: true }
        ).populate('owner')
  
        // leveledUpPokemon.evolvesTo.forEach(evolution => {
        //   if (evolution.trigger === 'level-up' && evolution.minLevel !== null && leveledUpPokemon.level >= evolution.minLevel) {
            
        //   }
        // })
        
        res.status(200).json(leveledUpPokemon)
      } else {
        res.status(200).json(pokemon)
      }
    } else {
      res.status(200).json(pokemon)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
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
        } else {
          res.status(401).json('Cannot Evolve Pokemon')
          return
        }
      })
    } else  {
      pokemon.evolvesTo.forEach(evolution => {
        if (evolution.trigger === 'level-up' && evolution.minLevel !== null && pokemon.level >= evolution.minLevel) {
          evolvePokemon = evolution.name
        } else if (evolution.trigger === 'level-up' && evolution.minLevel === null && pokemon.level >= 32) {
          evolvePokemon = evolution.name
        } else {
          res.status(401).json('Cannot Evolve Pokemon')
          return
        }
      })
    }

    if (evolvePokemon) {
      const dbPokemon = await Pokemon.findOne({ name: evolvePokemon })

      if (dbPokemon) {

        let evolveStats = []

        pokemon.stats.forEach(stat => {
          dbPokemon.stats.forEach(dbStat => {
            if (dbStat.name === stat.name) {
              evolveStats.push({
                name: stat.name,
                baseStat: dbPokemon.baseStat,
                effort: dbPokemon.effort,
                iV: stat.iV,
                effortPoints: stat.effortPoints
              })
            }
          })
        })

        let hp, attack, defense, spAttack, spDefense, speed
        const pokemonLevel = pokemon.level

        dbPokemon.stats.forEach(dbStat => {
          pokemon.stats.forEach(stat => {
            if (dbStat.stat.name === stat.name) {
              evolveStats.push({
                name: stat.name,
                baseStat: dbPokemon.baseStat,
                effort: dbPokemon.effort,
                iV: stat.iV,
                effortPoints: stat.effortPoints
              })
              if (dbStat.name === 'hp') {
                hp = ((((2 * dbStat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/ 100) + pokemonLevel + 10)
              } 
              else if (dbStat.name === 'attack') {
                attack = ((((2 * dbStat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
              }
              else if (dbStat.name === 'defense') {
                defense = ((((2 * dbStat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
              }
              else if (dbStat.name === 'special-defense') {
                spDefense = ((((2 * dbStat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
              }
              else if (dbStat.name === 'special-attack') {
                spAttack = ((((2 * dbStat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
              }
              else if (dbStat.name === 'speed') {
                speed = ((((2 * dbStat.baseStat + stat.iV + (stat.effortPoints / 4)) * pokemonLevel)/100) + 5)
              }
            }
          })
        })

        const evolutionForm = {
          name: dbPokemon.name,
          pokedexNum: dbPokemon.pokedexNum,
          types: dbPokemon.types,
          spriteFront: dbPokemon.spriteFront,
          spriteBack: dbPokemon.spriteBack,
          evolves: dbPokemon.evolves,
          evolvesTo: dbPokemon.evolvesTo,
          stats: evolveStats,
          potentialMoves: dbPokemon.potentialMoves,
          growthRate: dbPokemon.growthRate,
          totalHP: hp,
          attack: attack,
          defense: defense,
          spAttack: spAttack,
          spDefense: spDefense,
          speed: speed
        }
    
        
        const evolvedPokemon = await Pokemon.findByIdAndUpdate(
          req.params.id,
          evolutionForm,
          { new: true }
          ).populate('owner')
    
          
        res.status(201).json(evolvedPokemon)
      } else {

        const evolutionPokemonData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${evolvePokemon}`)
        
        const eData = evolutionPokemonData.data
        
        const speciesData = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${evolvePokemon}`)
        
        const evolutionChainData = await axios.get(`${speciesData.data.evolution_chain.url}`)
    
        
        let evolves = false
        let evolvesTo = []
    
    
    
        if (evolutionChainData.data.chain.species.name === eData.name){
    
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
            console.log('hello')
            if (evolutionChainData.data.chain.evolves_to.length && evolutionChainData.data.chain.evolves_to[0].evolution_details[0].item !== null) {
              console.log('ITEM!')
              evolves = true
              evolvesTo.push({
                name: `${evolutionChainData.data.chain.evolves_to[0].species.name}`,
                trigger: `${evolutionChainData.data.chain.evolves_to[0].evolution_details[0].trigger.name}`,
                minLevel: evolutionChainData.data.chain.evolves_to[0].evolution_details[0].min_level,
                item: `${evolutionChainData.data.chain.evolves_to[0].evolution_details[0].item.name}`
              })
            } 
            else if (evolutionChainData.data.chain.evolves_to.length) {
              console.log('NO ITEM')
              evolves = true
              evolvesTo.push({
                name: `${evolutionChainData.data.chain.evolves_to[0].species.name}`,
                trigger: `${evolutionChainData.data.chain.evolves_to[0].evolution_details[0].trigger.name}`,
                minLevel: evolutionChainData.data.chain.evolves_to[0].evolution_details[0].min_level,
                item: null
              })
            }
          }
    
        } else if (evolutionChainData.data.chain.evolves_to[0].species.name === eData.name && evolutionChainData.data.chain.evolves_to[0].evolves_to.length) {
          console.log('SECOND EVOLUTION TO THIRD')
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
            console.log('THIRD TO FOURTH?')
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
    
        const name = eData.name
        const pokedexNum = eData.id
        const spriteFront = eData.sprites.front_default
        const spriteBack = eData.sprites.back_default
    
    
        const evolutionForm = {
          name: name,
          pokedexNum: pokedexNum,
          types: typeSet,
          spriteFront: spriteFront,
          spriteBack: spriteBack,
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
    
        
        const evolvedPokemon = await Pokemon.findByIdAndUpdate(
          req.params.id,
          evolutionForm,
          { new: true }
          ).populate('owner')
    
          
        res.status(201).json(evolvedPokemon)
      }


    }

    
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const newMove = async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id)
    const searchMove = req.body.newMove
    let knowsMove

    pokemon.moveSet.forEach(move => {
      if (move.name === searchMove.name) {
        knowsMove = true
        res.status(401).json('Move already learned.')
      } else {
        knowsMove = false
      }
    })

    if (knowsMove === false) {

      if (searchMove.method === 'level-up' && searchMove.level === pokemon.level) {
        const dataBaseMove = await Move.findOne({ name: searchMove.name })
        if (dataBaseMove) {
          if (pokemon.moveSet.length === 4) {
            const moveDoc = pokemon.moveSet.id(req.body.oldMoveId)
            moveDoc.set(dataBaseMove)
            await pokemon.save()
    
            res.status(201).json(dataBaseMove)
          } else {
            pokemon.moveSet.push(dataBaseMove)
            await pokemon.save()
            const newMoveDoc = pokemon.moveSet[pokemon.moveSet.length -1]
    
            res.status(201).json(newMoveDoc)
          }
        } else {
          const newMoveData = await axios.get(`${searchMove.url}`)
          const move = newMoveData.data
    
          const newMoveForm = {
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
          }
  
          newMoveForm.effect = (move.effect.replace('$effect_chance', `${move.effectChance}`))

          const newMove = await Move.create(newMoveForm)
    
          if (pokemon.moveSet.length === 4) {
            const moveDoc = pokemon.moveSet.id(req.body.oldMoveId)
            moveDoc.set(newMove)
            await pokemon.save()
    
            res.status(201).json(moveDoc)
          } else {
            pokemon.moveSet.push(newMove)
            await pokemon.save()
            const newMoveDoc = pokemon.moveSet[pokemon.moveSet.length -1]
    
            res.status(201).json(newMoveDoc)
          }
        }
      } else if (searchMove.method === 'machine' && req.body.machine) {
        const machine = req.body.machine
  
        if (searchMove.name === machine.move) {
          const dataBaseMove = await Move.findOne({ name: searchMove.name })

          if (dataBaseMove) {
            if (pokemon.moveSet.length === 4) {
              const moveDoc = pokemon.moveSet.id(req.body.oldMoveId)
              moveDoc.set(dataBaseMove)
              await pokemon.save()
      
              res.status(201).json(moveDoc)
            } else {
              pokemon.moveSet.push(dataBaseMove)
              await pokemon.save()
              const newMoveDoc = pokemon.moveSet[pokemon.moveSet.length -1]
      
              res.status(201).json(newMoveDoc)
            }
          } else {
            const newMoveData = await axios.get(`${searchMove.url}`)
            const move = newMoveData.data
    
            const newMoveForm = {
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
            }
  
            newMoveForm.effect = (move.effect.replace('$effect_chance', `${move.effectChance}`))

            const newMove = await Move.create(newMoveForm)
    
            if (pokemon.moveSet.length === 4) {
              const moveDoc = pokemon.moveSet.id(req.body.oldMoveId)
              moveDoc.set(newMove)
              await pokemon.save()
      
              res.status(201).json(moveDoc)
            } else {
              pokemon.moveSet.push(newMove)
              await pokemon.save()
              const newMoveDoc = pokemon.moveSet[pokemon.moveSet.length -1]
      
              res.status(201).json(newMoveDoc)
            }
          }
          }
  
      } else {
        res.status(401).json('Cannot Learn Move.')
      }
    }


  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}


export { 
  create,
  index,
  show,
  showParty,
  updatePokemon,
  deletePokemon,
  expGain,
  levelUpPokemon,
  evolvePokemon,
  newMove,
  addPokemonToParty,
  addPokemonToPC,
}