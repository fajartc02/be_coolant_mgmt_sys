const linesMap = require('./linesMapControllers')
const machinesStatusMap = require('./machinesStatusMapControllers')
const linesSummaries = require('./linesSummariesControllers')
const machineCheck = require('./maintenanceMachineControllers')
const machineChemicalChanges = require('./machineChemicalChangesControllers')
const costCalculation = require('./costCalculationControllers')

module.exports = {
    linesMap,
    machinesStatusMap,
    linesSummaries,
    machineCheck,
    machineChemicalChanges,
    costCalculation
}