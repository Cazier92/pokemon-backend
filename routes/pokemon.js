import { Router } from 'express'
import * as pokemonCtrl from '../controllers/pokemon.js'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'

const router = Router()

/*---------- Public Routes ----------*/

router.put('/update/:id', pokemonCtrl.updatePokemon)
router.put('/levelup/:id', pokemonCtrl.levelUpPokemon)
router.put('/evolve/:id', pokemonCtrl.evolvePokemon)
router.put('/expgain/:id', pokemonCtrl.expGain)
router.put('/newmove/:id', pokemonCtrl.newMove)

/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)

router.get('/', checkAuth, pokemonCtrl.index)
router.get('/partyPokemon', checkAuth, pokemonCtrl.showParty)
router.get('/:id', checkAuth, pokemonCtrl.show)

router.put('/party/:userId/:pokemonId', checkAuth, pokemonCtrl.addPokemonToParty)
router.put('/pc/:userId/:pokemonId', checkAuth, pokemonCtrl.addPokemonToPC)

router.post('/', checkAuth, pokemonCtrl.create)


export { router }