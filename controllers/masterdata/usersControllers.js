const table = require('../../config/table')
const { queryGET, queryCustom } = require('../../helpers/query')
const response = require('../../helpers/response')

module.exports = {
    getData: async(req, res) => {
        try {
            await queryGET(table.tb_m_users, null)
                .then((result) => {
                    response.success(res, 'Success to get all users', result)
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    },
    getDataWithGroup: async(req, res) => {
        try {
            let q = `select 
	tmu.*, 
	tmg.group_nm, 
	tmg.group_desc 
from ${table.tb_m_users} tmu 
join ${table.tb_m_group} tmg 
	on tmg.group_id = tmu.group_id`
            await queryCustom(q)
                .then((result) => {
                    response.success(res, 'Success to get all users with group', result.rows)
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    },
}