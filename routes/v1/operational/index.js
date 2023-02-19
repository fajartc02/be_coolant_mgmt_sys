const router = require('express')()
const linesMap = require('./linesMap')
const machinesStatusMap = require('./machinesStatusMap')
const linesSummaries = require('./linesSummaries')


router.use('/dashboard/linesMap', linesMap)
router.use('/dashboard/machinesStatusMap', machinesStatusMap)
router.use('/dashboard/linesSummaries', linesSummaries)


module.exports = router