import { Router } from 'express'
import * as pokemonCtrl from '../controllers/pokemon.js'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'

const router = Router()

/*---------- Public Routes ----------*/

router.put('/update/:id', pokemonCtrl.updatePokemon)


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)

router.get('/', checkAuth, pokemonCtrl.index)
router.get('/partyPokemon', checkAuth, pokemonCtrl.showParty)
router.get('/:id', checkAuth, pokemonCtrl.show)

router.put('/party/:userId/:pokemonId', checkAuth, pokemonCtrl.addPokemonToParty)
router.put('/pc/:userId/:pokemonId', checkAuth, pokemonCtrl.addPokemonToPC)
router.put('/expgain/:id/:fainted', checkAuth, pokemonCtrl.expGain)
router.put('/levelup/:id', checkAuth, pokemonCtrl.levelUpPokemon)
router.put('/evolve/:id', checkAuth, pokemonCtrl.evolvePokemon)
router.put('/newmove/:id', checkAuth, pokemonCtrl.newMove)

router.post('/', checkAuth, pokemonCtrl.create)


export { router }