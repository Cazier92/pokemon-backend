import { Router } from 'express'
import * as pokemonCtrl from '../controllers/pokemon.js'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'

const router = Router()

/*---------- Public Routes ----------*/

// router.get('/test', pokemonCtrl.test)
router.get('/:id', pokemonCtrl.show)
router.put('/update/:id', pokemonCtrl.updatePokemon)
router.put('/levelup/:id', pokemonCtrl.levelUpPokemon)
router.put('/evolve/:id', pokemonCtrl.evolvePokemon)
router.put('/expgain/:id', pokemonCtrl.expGain)

/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.post('/', pokemonCtrl.create)


export { router }