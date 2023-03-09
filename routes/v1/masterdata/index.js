const router = require('express')()
const lines = require('./lines')
const machines = require('./machines')
const chemicals = require('./chemicals')
const users = require('./users')
const groups = require('./groups')
const mtMachinesSchedules = require('./maintenance/index')


router.use('/lines', lines)
router.use('/machines', machines)
router.use('/chemicals', chemicals)
router.use('/users', users)
router.use('/groups', groups)
router.use('/maintenance', mtMachinesSchedules)


module.exports = router