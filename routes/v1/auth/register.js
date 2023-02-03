const router = require('express')()
const { register } = require('../../../controllers/index')

router.post('/', register)


module.exports = router