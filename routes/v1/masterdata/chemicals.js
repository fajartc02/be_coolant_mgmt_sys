const router = require('express')()
const { chemicals } = require('../../../controllers/index')
const auth = require('../../../helpers/auth')

router.get('/', auth.verifyToken, chemicals.getData)
router.get('/machine/:machine_id', auth.verifyToken, chemicals.getDataByMachine)

module.exports = router