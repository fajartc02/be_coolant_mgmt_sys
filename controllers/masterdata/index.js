const lines = require('./linesControllers')
const machines = require('./machinesControllers')
const chemicals = require('./chemicalsControllers')
const users = require('./usersControllers')
const groups = require('./groupsControllers')
const maintenanceSchedules = require('./maintenanceSchedules')

module.exports = {
    lines,
    machines,
    chemicals,
    users,
    groups,
    maintenanceSchedules
}