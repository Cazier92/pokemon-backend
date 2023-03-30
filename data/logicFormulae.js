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
    return `Yes! ${name} was caught!`
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
  // console.log('hello')

  shakeCheck(shakeCount, b, name)
}

function shakeCheck(count, b, name) {
  let randomNum = Math.floor(Math.random() * 65536)
  console.log('randomNum',randomNum)
  console.log('b', b)

  if (count <= 0) {
    console.log(`Yes! The ${name} was caught!`) 
    return
  } else if (randomNum >= b) {
    console.log(`Oh no! The wild ${name} escaped!`)
    return
  } else {
    let newCount = count -1
    shakeCheck(newCount, b, name)
    console.log('count is:', newCount)
  }
}

const bulbasaur = {
  name: 'Bulbasaur',
  totalHP: 148,
  currentHP: 148,
  captureRate: 65,
  statusCondition: null
}

const greatBall = {
  name: 'Great Ball',
  bonus: 1.5
}

catchPokemon(bulbasaur, greatBall)




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

}


