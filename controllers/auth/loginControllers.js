const table = 'tb_m_users'
const { queryGET } = require('../../helpers/query')
const security = require('../../helpers/security')
const auth = require('../../helpers/auth')
const response = require('../../helpers/response')

module.exports = {
    login: async(req, res) => {
        console.log(req.body);
        try {
            await queryGET(table, `WHERE noreg = '${req.body.noreg}' AND is_activated = true`)
                .then(async(result) => {
                    if (result.length > 0) {
                        let hashPassword = result[0].password
                        await security.decryptPassword(req.body.password, hashPassword).then(async decryptPass => {
                            if (decryptPass) {
                                let token = await auth.generateToken({ name: result[0].name, noreg: result[0].noreg })
                                response.success(res, 'Success to Login', { data: result[0], token })
                            }
                        })
                    } else {
                        // User not found in DB
                        throw false
                    }
                })
        } catch (error) {
            response.notAllowed(res, error == false ? 'Noreg / Password Salah' : error)
        }
    }
}