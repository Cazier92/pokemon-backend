import { Router } from 'express'
import * as profilesCtrl from '../controllers/profiles.js'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'

const router = Router()

/*---------- Public Routes ----------*/


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)

router.get('/', checkAuth, profilesCtrl.index)
router.get('/pack', checkAuth, profilesCtrl.packIndex)
router.get('/:id', checkAuth, profilesCtrl.show)

router.put('/:id/add-photo', checkAuth, profilesCtrl.addPhoto)
router.put('/:id/update', checkAuth, profilesCtrl.updateProfile)


export { router }
