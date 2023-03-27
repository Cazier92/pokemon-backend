import mongoose from 'mongoose'

const Schema = mongoose.Schema

const typeSchema = new Schema({
  slot: {type: Number, 
    required: true,
    enum: [
      1, 2
    ]
  },
  name: {type: String, required: true},
})

const potentialMoveSchema = new Schema({
  name: {type: String, required: true},
  url: {type: String, required: true},
  level: {type: Number, required: true},
  method: {type: String, 
    required: true,
    enum: [
      'level-up', 'egg', 'machine', 'tutor'
    ]
  },
})

const moveSchema = new Schema({
  name: {type: String, required: true},
  type: {type: String, required: true},
  accuracy: {type: Number || null, required: true},
  effect: {type: String, required: true},
  effectChance: {type: Number || null, required: true},
  damageClass: {type: String, required: true},
  totalPP: {type: Number, required: true},
  currentPP: {type: Number, required: true},
  power: {type: Number, required: true},
  priority: {type: Number, required: true},
})

const statSchema = new Schema({
  name: {type: String, required: true},
  baseStat: {type: Number, required: true},
  effort: {type: Number, required: true}
})

const pokemonSchema = new Schema({
  name: {type: String, required: true},
  level: {type: Number, required: true, min: 1, max: 100, default: 5},
  types: {type: [typeSchema], required: true},
  pokedexNum: {type: Number, required: true},
  potentialMoves: {type: [potentialMoveSchema], required: true},
  moveSet: {type: [moveSchema], 
    required: true,
    min: 1,
    max: 4
  },
  spriteFront: String,
  spriteBack: String,
  stats: [statSchema],
  owner: {type: Schema.Types.ObjectId, ref: 'Profile'},
},{
  timestamps: true,
})

const Pokemon = mongoose.model('Pokemon', pokemonSchema)

export { Pokemon }
