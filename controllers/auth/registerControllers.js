const table = 'tb_m_users'
const { queryPOST } = require('../../helpers/query')
const security = require('../../helpers/security')
const response = require('../../helpers/response')

module.exports = {
    register: async(req, res) => {
        try {
            let unreadPassword = await security.encryptPassword(req.body.password)
            req.body.password = unreadPassword
            await queryPOST(table, req.body)
                .then((result) => {
                    response.success(res, 'Success to create User', result)
                })
        } catch (error) {
            response.notAllowed(res, error)
        }
    }
}