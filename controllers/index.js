const { lines, machines } = require('./masterdata')
const { linesMap, machinesStatusMap } = require('./operational')
const { register, login } = require('./auth/index')
const { getPublicGroup } = require('./public/groupController')

module.exports = {
    // AUTH
    register,
    login,
    // PUBLIC
    getPublicGroup,

    lines: {
        getData: lines.getData,
        postData: lines.postData
    },
    machines: {
        getData: machines.getData,
    },
    linesMap: {
        getData: linesMap.getData
    },
    machinesStatusMap: {
        getData: machinesStatusMap.getData
    }
}