const router = require('express')()
const linesMap = require('./linesMap')
const machinesStatusMap = require('./machinesStatusMap')


router.use('/dashboard/linesMap', linesMap)
router.use('/dashboard/machinesStatusMap', machinesStatusMap)


module.exports = router