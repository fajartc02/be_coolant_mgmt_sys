const router = require('express')()
const { users } = require('../../../controllers/index')
const auth = require('../../../helpers/auth')

router.get('/', auth.verifyToken, users.getData)
router.get('/group', auth.verifyToken, users.getDataWithGroup)

module.exports = router