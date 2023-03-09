const router = require('express')()
const { maintenanceSchedules } = require('../../../../controllers/masterdata')
const auth = require('../../../../helpers/auth')


router.get('/', auth.verifyToken, maintenanceSchedules.getData)


module.exports = router