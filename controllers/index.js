const { lines } = require('./masterdata')
const { register, login } = require('./auth/index')


module.exports = {
    // AUTH
    register,
    login,

    lines
}