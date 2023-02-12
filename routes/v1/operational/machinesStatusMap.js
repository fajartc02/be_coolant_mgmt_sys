const router = require('express')()
const { machinesStatusMap } = require('../../../controllers/index')
const auth = require('../../../helpers/auth')

router.get('/:line_id', auth.verifyToken, machinesStatusMap.getData)


module.exports = router