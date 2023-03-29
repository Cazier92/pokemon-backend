import { Router } from 'express'
import * as pokemonCtrl from '../controllers/pokemon.js'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'

const router = Router()

/*---------- Public Routes ----------*/

// router.get('/test', pokemonCtrl.test)
router.post('/', pokemonCtrl.create)

/*---------- Protected Routes ----------*/


export { router }