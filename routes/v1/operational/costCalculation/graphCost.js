const router = require('express')()
const { costCalculation } = require('../../../../controllers/operational/index')

const auth = require('../../../../helpers/auth')

router.get('/', auth.verifyToken, costCalculation.getGraphData)

module.exports = router