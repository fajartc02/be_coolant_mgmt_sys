const { lines, machines, chemicals, users, groups } = require('./masterdata')
const { linesMap, machinesStatusMap, linesSummaries, machineCheck } = require('./operational')
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
        getChecksheetList: machineCheck.getChecksheetList,
        postChecksheetList: machineCheck.postChecksheetList,
        getMaintenanceMachine: machineCheck.getMaintenanceMachine
    }
}