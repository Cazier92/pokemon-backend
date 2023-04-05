import { Router } from 'express'
import * as mapCtrl from '../controllers/map.js'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'

const router = Router()

/*---------- Public Routes ----------*/

router.get('/', mapCtrl.index)
router.get('/:id', mapCtrl.show)

router.put('/:id', mapCtrl.updateMap)

router.post('/', mapCtrl.create)


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)


export { router }