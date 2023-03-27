import { Router } from 'express'
import * as apiCtrl from '../controllers/api.js'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'

const router = Router()

/*---------- Public Routes ----------*/

router.get('/pokemon/:name', apiCtrl.findPokemon)
router.get('/move', apiCtrl.findMove)

/*---------- Protected Routes ----------*/


export { router }
