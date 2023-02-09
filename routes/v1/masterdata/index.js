const router = require('express')()
const lines = require('./lines')
const machines = require('./machines')


router.use('/lines', lines)
router.use('/machines', machines)


module.exports = router