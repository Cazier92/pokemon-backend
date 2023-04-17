//! Catch Rate:
//& a = (((3* HPMax - 2* HPCurrent) * rate * bonusBall) / (3* HPMax)) * bonusStatus
//& b = 1048560 / (Math.sqrt(Math.sqrt(16711680 / a)))
//& shakeCount = 4
//& shake check: randomNum = Number: 0 - 65535
//& if (randomNum >= b) {return}
//& else {shakeCount --}
//& if shakeCount <= 0 {caught}

//^ Necessary parameters for function: 
//^ pokemon: pokemon to be caught
//^ ball: pokeball being used (ie: pokeball, great ball, ultra ball, master ball)

function catchPokemon(pokemon, ball) {
  let bonusStatus
  let name = pokemon.name
  
  if (ball.name === 'Master Ball') {
    console.log(`Yes! ${name} was caught!`)
    return true
  }
  
  let ballBonus = ball.bonus
  
  
  if (pokemon.statusCondition === 'freeze' || pokemon.statusCondition === 'sleep') {
    bonusStatus = 2
  } else if (pokemon.statusCondition === 'paralyze' || pokemon.statusCondition === 'poison' || pokemon.statusCondition === 'burn') {
    bonusStatus = 1.6
  } else if (pokemon.statusCondition === 'confused') {
    bonusStatus = 1.3
  } else {
    bonusStatus = 1
  } 

  const totalHP = pokemon.totalHP
  const currentHP = pokemon.currentHP
  const captureRate = pokemon.captureRate
  
  let a = (((3* totalHP - 2* currentHP) * captureRate * ballBonus) / (3* totalHP)) * bonusStatus
  
  let b = 1048560 / (Math.sqrt(Math.sqrt(16711680 / a)))

  let shakeCount = 4

  for (let i = shakeCount; i >= 0; i--) {
    let randomNum = Math.floor(Math.random() * 65536)
    if (shakeCount <= 0) {
      return true
    } else if (randomNum >= b) {
      return false
    } else {
      shakeCount --
    }
  }

}

function shakeCheck(count, b, name) {
  let randomNum = Math.floor(Math.random() * 65536)
  // console.log('randomNum',randomNum)
  // console.log('b', b)

  if (count <= 0) {
    console.log(`Yes! The ${name} was caught!`) 
    return true
  } else if (randomNum >= b) {
    console.log(`Oh no! The wild ${name} escaped!`)
    return false
  } else {
    let newCount = count -1
    shakeCheck(newCount, b, name)
    // console.log('count is:', newCount)
  }
}

// const bulbasaur = {
//   name: 'Bulbasaur',
//   totalHP: 148,
//   currentHP: 148,
//   captureRate: 65,
//   statusCondition: null
// }

// const greatBall = {
//   name: 'Great Ball',
//   bonus: 1.5
// }

// catchPokemon(bulbasaur, greatBall)




//! Experience Gain algorithm:
//& expGain = ((b * l) / 7) * (1 / s) * e * a * t
/*
& Where: a = 1 if fainted pokemon is wild, 1.5 if owned by a trainer
& b = baseExpYield of fainted pokemon
& e = 1.5 if pokemon is holding a lucky egg, else 1
& l = level of fainted pokemon
& s = the number of pokemon that participated in the battle w/o fainting
& t = 1 if the winning pokemon's owner === originalOwner, 1.5 if not
*/

function expGainCalc(faintedPokemon, winner, participants) {
  let a, b, e, l, s, t

  if (faintedPokemon.currentHP <= 0) {
    if (faintedPokemon.owner) {
      a = 1.5
    } else {
      a = 1
    }
  
    b = faintedPokemon.baseExpYield
  
    if (winner.holdItem && winner.holdItem.name === 'Lucky Egg') {
      e = 1.5
    } else {
      e = 1
    }
  
    l = faintedPokemon.level
  
    s = participants.length
  
    if (winner.originalOwner === winner.owner) {
      t = 1
    } else {
      t = 1.5
    }
  
    const expGain = ((b * l) / 7) * (1 / s) * e * a * t
  
    return expGain
  } else {
    return 0
  }


}

//! Damage algorithm:
/*
& Damage = ((((((2* Level)/5)+2)* Power * (A/D)) /50) * Burn * Screen * Weather * FF +2 ) * Critical * DoubleDmg * STAB * Type * random

& Where:
& Level = level of attacking Pokemon
& A = (if physical attack): Attack Stat, (if special Attack): spAttack
& D = Defense Stat/spDefense Stat of target Pokemon
& Power = power of move
& Burn = (if attackType === physical && status === 'burn'): 0.5, else 1
& Screen = (if opponent reflect/light screen && attack phys/spec): .5, else 1
& Weather = (if rain): (if water): 1.5 (if fire || solarbeam): .5, (if sun): (if fire): 1.5, (if water): .5, else 1
& Critical = 2 for critical hit, else 1
& DoubleDmg: Move Based, make 1, modify later.
& STAB: Same Type Attack Bonus
& Type: type effectiveness: .25, .5, 1, 2, 4
& random: number between .85 & 1
*/

function calcDamage(attacker, target, move) {
  const level = attacker.level
  const power = move.power
  let a
  let d
  let burn = 1
  let screen = 1
  let weather = 1
  let critical = 1
  let doubleDmg = 1
  let stab = 1
  let typeEffect = 1
  target.types.forEach(type => {
    if (type === 'normal') {
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'ghost') {
        typeEffect = typeEffect * 0
      }
    }
    if (type === 'fighting') {
      if (move.type === 'flying') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'rock') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'bug') {
        typeEffect = typeEffect * 0.5
      }

      if (move.type === 'psychic') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'dark') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'fairy') {
        typeEffect = typeEffect * 2
      }
    }
    if (type === 'flying') {
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'ground') {
        typeEffect = typeEffect * 0
      }
      if (move.type === 'rock') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'bug') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'grass') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'electric') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'ice') {
        typeEffect = typeEffect * 2
      }
    }
    if (type === 'poison') {
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'poison') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'ground') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'bug') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'grass') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'psychic') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'fairy') {
        typeEffect = typeEffect * 0.5
      }
    }
    if (type === 'ground') {
      if (move.type === 'poison') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'rock') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'water') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'grass') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'electric') {
        typeEffect = typeEffect * 0
      }
      if (move.type === 'ice') {
        typeEffect = typeEffect * 2
      }
    }
    if (type === 'rock') {
      if (move.type === 'normal') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'flying') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'poison') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'ground') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'steel') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'fire') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'water') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'grass') {
        typeEffect = typeEffect * 2
      }
    }
    if (type === 'bug') {
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'flying') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'ground') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'rock') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'fire') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'grass') {
        typeEffect = typeEffect * 0.5
      }
    }
    if (type === 'ghost') {
      if (move.type === 'normal') {
        typeEffect = typeEffect * 0
      }
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 0
      }
      if (move.type === 'poison') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'bug') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'ghost') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'dark') {
        typeEffect = typeEffect * 2
      }
    }
    if (type === 'steel') {
      if (move.type === 'normal') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'flying') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'poison') {
        typeEffect = typeEffect * 0
      }
      if (move.type === 'ground') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'rock') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'bug') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'steel') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'fire') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'grass') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'psychic') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'ice') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'dragon') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'fairy') {
        typeEffect = typeEffect * 0.5
      }
    }
    if (type === 'fire') {
      if (move.type === 'ground') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'rock') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'bug') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'steel') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'fire') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'water') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'grass') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'ice') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'fairy') {
        typeEffect = typeEffect * 0.5
      }
    }
    if (type === 'water') {
      if (move.type === 'steel') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'fire') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'water') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'grass') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'electric') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'ice') {
        typeEffect = typeEffect * 0.5
      }
    }
    if (type === 'grass') {
      if (move.type === 'flying') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'poison') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'ground') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'bug') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'fire') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'water') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'grass') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'electric') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'ice') {
        typeEffect = typeEffect * 2
      }
    }
    if (type === 'electric') {
      if (move.type === 'flying') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'ground') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'steel') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'electric') {
        typeEffect = typeEffect * 0.5
      }
    }
    if (type === 'psychic') {
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'bug') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'ghost') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'psychic') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'dark') {
        typeEffect = typeEffect * 2
      }
    }
    if (type === 'ice') {
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'rock') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'steel') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'fire') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'ice') {
        typeEffect = typeEffect * 0.5
      }
    }
    if (type === 'dragon') {
      if (move.type === 'fire') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'water') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'grass') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'electric') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'ice') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'dragon') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'fairy') {
        typeEffect = typeEffect * 2
      }
    }
    if (type === 'dark') {
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'bug') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'ghost') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'psychic') {
        typeEffect = typeEffect * 0
      }
      if (move.type === 'dark') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'fairy') {
        typeEffect = typeEffect * 2
      }
    }
    if (type === 'fairy') {
      if (move.type === 'fighting') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'poison') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'bug') {
        typeEffect = typeEffect * 0.5
      }
      if (move.type === 'steel') {
        typeEffect = typeEffect * 2
      }
      if (move.type === 'dragon') {
        typeEffect = typeEffect * 0
      }
      if (move.type === 'dark') {
        typeEffect = typeEffect * 0.5
      }
    }
  })
  const randomNum = ((Math.floor(Math.random() * (101 - 85) + 85)) / 100)
  if (move.damageClass === 'physical') {
    a = attacker.attack
    d = target.defense
  }
  if (move.damageClass === 'special') {
    a = attacker.spAttack
    d = target.spDefense
  }
  if (attacker.statusCondition === 'burn') {
    burn = 0.5
  }
  attacker.types.forEach(type => {
    if (move.type === type.name) {
      stab = 1.5
    }
  })
  const damage = ((((((2* level)/5)+2)* power * (a/d)) /50) * burn * screen * weather +2 ) * critical * doubleDmg * stab * typeEffect * randomNum
  return damage
}

export {
  catchPokemon,
  expGainCalc,
  calcDamage,
}


