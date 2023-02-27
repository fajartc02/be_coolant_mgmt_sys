const router = require('express')()
const machine = require('./machine')

router.use('/machine', machine)

module.exports = router