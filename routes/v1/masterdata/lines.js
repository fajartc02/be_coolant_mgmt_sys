const router = require('express')()
const { lines } = require('../../../controllers/index')
const auth = require('../../../helpers/auth')



router.get('/lines', auth.verifyToken, lines.getData)
router.post('/lines', auth.verifyToken, lines.postData)


module.exports = router