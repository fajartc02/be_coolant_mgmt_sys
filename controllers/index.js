const { lines, machines, chemicals, users, groups } = require('./masterdata')
const { linesMap, machinesStatusMap, linesSummaries, machineCheck, machineChemicalChanges, costCalculation } = require('./operational')
const { register, login } = require('./auth/index')
const { getPublicGroup } = require('./public/groupController')

module.exports = {
    // AUTH
    register,
    login,
    // PUBLIC
    getPublicGroup,
    // MASTER
    users: {
        getData: users.getData,
        getDataWithGroup: users.getDataWithGroup
    },
    groups: {
        getData: groups.getData,
    },
    lines: {
        getData: lines.getData,
        postData: lines.postData
    },
    machines: {
        getData: machines.getData,
        getDataWithLine: machines.getDataWithLine
    },
    chemicals: {
        getData: chemicals.getData,
        getDataByMachine: chemicals.getDataByMachine
    },
    // OPERATIONAL
    linesMap: {
        getData: linesMap.getData
    },
    machinesStatusMap: {
        getData: machinesStatusMap.getData
    },
    linesSummaries: {
        getData: linesSummaries.getData
    },
    machineCheck: {
        postData: machineCheck.postData,
        getMaintenanceMachine: machineCheck.getMaintenanceMachine,
        getMtMachineChecksheet: machineCheck.getMtMachineChecksheet,
        getChecksheetTask: machineCheck.getChecksheetTask,
    },
    machineChemicalChanges: {
        postBulkData: machineChemicalChanges.postData,
        checkChemical: machineChemicalChanges.checkChemical,
        parametersEvaluate: machineChemicalChanges.parametersEvaluate
    },
    costCalculation: {
        getGraphData: costCalculation.getGraphData
    }
}