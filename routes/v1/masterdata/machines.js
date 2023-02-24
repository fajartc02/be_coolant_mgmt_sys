const router = require('express')()
const { machines } = require('../../../controllers/index')
const auth = require('../../../helpers/auth')


router.get('/line', auth.verifyToken, machines.getDataWithLine)
router.get('/:machine_id', auth.verifyToken, machines.getData)
router.get('/', auth.verifyToken, machines.getData)


module.exports = router