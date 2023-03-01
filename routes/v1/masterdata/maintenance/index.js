const router = require('express')()
const schedules = require('./schedules')


router.use('/schedules', schedules)


module.exports = router