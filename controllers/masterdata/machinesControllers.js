const table = 'tb_m_machines'
const { queryGET, queryPOST } = require('../../helpers/query')
const response = require('../../helpers/response')
module.exports = {
    getData: async (req, res) => {
        try {
            let whereCond = ''
            if (req.params._id) {
                whereCond = ` AND machine_id = ${req.params._id}`
            }
            await queryGET(table).then((result) => {
                response.success(res, 'Success to get all machines', result)
            })
        } catch (error) {
            response.failed(res, error)
        }
    },
}