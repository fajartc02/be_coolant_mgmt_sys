const router = require('express')()
const { getPublicGroup } = require('../../../controllers/public/groupController')

router.get('/group', getPublicGroup)

module.exports = router