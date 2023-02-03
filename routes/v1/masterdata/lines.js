const router = require('express')()
const { lines } = require('../../../controllers/index')



router.get('/lines', lines.getData)


module.exports = router