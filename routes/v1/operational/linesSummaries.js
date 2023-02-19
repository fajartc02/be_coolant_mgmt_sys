const router = require('express')()
const { linesSummaries } = require('../../../controllers/index')
const auth = require('../../../helpers/auth')

router.get('/', auth.verifyToken, linesSummaries.getData)


module.exports = router