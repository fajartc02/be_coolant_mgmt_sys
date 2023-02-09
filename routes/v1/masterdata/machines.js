const router = require('express')()
const { machines } = require('../../../controllers/index')
const auth = require('../../../helpers/auth')



router.get('/', auth.verifyToken, machines.getData)


module.exports = router