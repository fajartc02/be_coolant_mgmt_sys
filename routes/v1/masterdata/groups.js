const router = require('express')()
const { groups } = require('../../../controllers/index')
const auth = require('../../../helpers/auth')

router.get('/', auth.verifyToken, groups.getData)

module.exports = router