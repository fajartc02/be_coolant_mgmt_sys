const linesMap = require('./linesMapControllers')
const machinesStatusMap = require('./machinesStatusMapControllers')
const linesSummaries = require('./linesSummariesControllers')
const machineCheck = require('./maintenanceMachineControllers')

module.exports = {
    linesMap,
    machinesStatusMap,
    linesSummaries,
    machineCheck
}