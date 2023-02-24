const router = require('express')()
const { machineCheck } = require('../../../../controllers/operational/index')

const auth = require('../../../../helpers/auth')


router.get('/machine/:machine_id', auth.verifyToken, machineCheck.getChecksheetList)
router.post('/machine/:periodic_check_id', auth.verifyToken, machineCheck.postChecksheetList)

module.exports = router