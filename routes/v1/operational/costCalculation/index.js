const router = require('express')()
const graphCost = require('./graphCost')

router.use('/graph', graphCost)

module.exports = router