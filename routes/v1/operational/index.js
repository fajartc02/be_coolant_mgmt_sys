const router = require('express')()
const linesMap = require('./linesMap')
const machinesStatusMap = require('./machinesStatusMap')
const linesSummaries = require('./linesSummaries')

const auth = require('../../../helpers/auth')

const maintenance = require('./maintenance/index')
const cost = require('./costCalculation/index')


router.use('/dashboard/linesMap', auth.verifyToken, linesMap)
router.use('/dashboard/machinesStatusMap', auth.verifyToken, machinesStatusMap)
router.use('/dashboard/linesSummaries', auth.verifyToken, linesSummaries)

router.use('/maintenance', maintenance)
router.use('/cost', cost)

module.exports = router