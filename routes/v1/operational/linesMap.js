const router = require('express')()
const { linesMap } = require('../../../controllers/index')
const auth = require('../../../helpers/auth')

router.get('/:line_id', auth.verifyToken, linesMap.getData)


module.exports = router