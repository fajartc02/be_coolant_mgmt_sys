const table = require('../../config/table')
const { queryGET } = require('../../helpers/query')
const response = require('../../helpers/response')

module.exports = {
    getData: async(req, res) => {
        try {
            await queryGET(table.tb_m_group, null, ['group_id', 'group_nm', 'is_deleted'])
                .then((result) => {
                    response.success(res, 'Success to get PUBLIC GROUP', result)
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    }
}