const lines = require('./linesControllers')
const machines = require('./machinesControllers')
const chemicals = require('./chemicalsControllers')
const users = require('./usersControllers')
const groups = require('./groupsControllers')

module.exports = {
    lines,
    machines,
    chemicals,
    users,
    groups
}