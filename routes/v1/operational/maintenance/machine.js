const router = require('express')()
const { machineCheck, machineChemicalChanges } = require('../../../../controllers/operational/index')

const auth = require('../../../../helpers/auth')


// router.get('/machine/:machine_id', auth.verifyToken, machineCheck.getChecksheetList)
router.get('/task', auth.verifyToken, machineCheck.getChecksheetTask)
router.get('/:machine_id', auth.verifyToken, machineCheck.getMaintenanceMachine)
router.get('/checksheet/:periodic_check_id', auth.verifyToken, machineCheck.getMtMachineChecksheet)
router.post('/chemicals', auth.verifyToken, machineChemicalChanges.postData)
router.post('/checksheet', auth.verifyToken, machineCheck.postData)
router.post('/chemicals/check', auth.verifyToken, machineChemicalChanges.checkChemical)
router.post('/parameters/evaluate', auth.verifyToken, machineChemicalChanges.parametersEvaluate)
    // router.post('/machine/:periodic_check_id', auth.verifyToken, machineCheck.postChecksheetList)

module.exports = router