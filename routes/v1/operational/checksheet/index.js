const router = require('express')()
const machineCheck = require('./machineCheck')

router.use('/check', machineCheck)

module.exports = router