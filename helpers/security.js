const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
    encryptPassword: async(password) => {
        var salt = await bcrypt.genSaltSync(10);
        var hash = await bcrypt.hashSync(password, salt);
        return hash
    },
    decryptPassword: (password, hash) => {
        return new Promise(async(resolve, reject) => {
            let is_correct = await bcrypt.compareSync(password, hash);
            console.log(is_correct);
            if (is_correct) { resolve(true) }
            reject(false)
        })
    },
    generateToken: async(payload) => {
        var token = await jwt.sign(payload, process.env.SECRET_KEY);
        return token
    },
}