const router = require('express')()
const { lines } = require('../../../controllers/index')
const auth = require('../../../helpers/auth')



router.get('/', auth.verifyToken, lines.getData)
router.get('/:_id', auth.verifyToken, lines.getData)
router.post('/', auth.verifyToken, lines.postData)


module.exports = router