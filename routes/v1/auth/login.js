const router = require('express')()
const { login } = require('../../../controllers/index')

router.post('/', login)


module.exports = router