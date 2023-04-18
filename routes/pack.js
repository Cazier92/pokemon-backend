import { Router } from 'express'
import * as packCtrl from '../controllers/pack.js'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'

const router = Router()

/*---------- Public Routes ----------*/

router.get('/', packCtrl.index)

/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)

router.get('/userPack', checkAuth, packCtrl.show)

router.put('/status', checkAuth, packCtrl.changePackStatus)
router.put('/new/:id', checkAuth, packCtrl.setNewPack)
router.put('/useMedicine/:medicineId/:pokemonId', checkAuth, packCtrl.useMedicine)

router.post('/ball', checkAuth, packCtrl.createBall)
router.post('/medicine', checkAuth, packCtrl.createMedicine)
router.post('/machine', checkAuth, packCtrl.createMachine)
router.post('/key', checkAuth, packCtrl.createKeyItem)


export { router }
