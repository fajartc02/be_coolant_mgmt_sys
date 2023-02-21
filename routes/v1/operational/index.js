const router = require('express')()
const linesMap = require('./linesMap')
const machinesStatusMap = require('./machinesStatusMap')
const linesSummaries = require('./linesSummaries')

const auth = require('../../../helpers/auth')

const checksheet = require('./checksheet/index')


router.use('/dashboard/linesMap', auth.verifyToken, linesMap)
router.use('/dashboard/machinesStatusMap', auth.verifyToken, machinesStatusMap)
router.use('/dashboard/linesSummaries', auth.verifyToken, linesSummaries)

router.use('/checksheet', checksheet)

module.exports = router