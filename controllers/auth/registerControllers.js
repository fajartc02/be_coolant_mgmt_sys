const table = 'tb_m_users'
const { queryPOST } = require('../../helpers/query')
const password = require('../../helpers/security')
const response = require('../../helpers/response')

module.exports = {
    register: async(req, res) => {
        try {
            let unreadPassword = await password.encrypt(req.body.password)
            console.log(unreadPassword);
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