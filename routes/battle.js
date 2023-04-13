import { Router } from 'express'
import * as battleCtrl from '../controllers/battle.js'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'

const router = Router()

/*---------- Public Routes ----------*/


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)

router.get('/move/:moveId', checkAuth, battleCtrl.findMove)

router.put('/move/:moveId/:userId/:targetId', checkAuth, battleCtrl.useMove)


export { router }