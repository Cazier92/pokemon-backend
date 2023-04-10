import { Router } from 'express'
import * as packCtrl from '../controllers/pack.js'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'

const router = Router()

/*---------- Public Routes ----------*/

router.get('/', packCtrl.index)

/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)

router.get('/userPack', checkAuth, packCtrl.show)

router.post('/ball', checkAuth, packCtrl.createBall)


export { router }
