const { lines } = require('./masterdata')
const { register, login } = require('./auth/index')
const { getPublicGroup } = require('./public/groupController')


module.exports = {
    // AUTH
    register,
    login,
    // PUBLIC
    getPublicGroup,

    lines
}