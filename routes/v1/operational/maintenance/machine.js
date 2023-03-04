const router = require('express')()
const { machineCheck } = require('../../../../controllers/operational/index')

const auth = require('../../../../helpers/auth')


// router.get('/machine/:machine_id', auth.verifyToken, machineCheck.getChecksheetList)
router.get('/task', auth.verifyToken, machineCheck.getChecksheetTask)
router.get('/:machine_id', auth.verifyToken, machineCheck.getMaintenanceMachine)
router.get('/checksheet/:periodic_check_id', auth.verifyToken, machineCheck.getMtMachineChecksheet)
    // router.post('/machine/:periodic_check_id', auth.verifyToken, machineCheck.postChecksheetList)

module.exports = router