const table = require('../../config/table')
const { queryGET, queryCustom } = require('../../helpers/query')
const response = require('../../helpers/response')
module.exports = {
    getData: async(req, res) => {
        try {
            let whereCond = ''
            if (req.params.machine_id) {
                whereCond = ` WHERE machine_id = ${req.params.machine_id}`
            }
            console.log(whereCond);
            await queryGET(table.tb_m_machines, whereCond).then((result) => {
                response.success(res, 'Success to get all machines', result)
            })
        } catch (error) {
            response.failed(res, error)
        }
    },
    getDataWithLine: async(req, res) => {
        try {
            let q = `SELECT
                        tmmc.*,
                        tml.line_nm
                    FROM ${table.tb_m_machines} tmmc
                    JOIN ${table.tb_m_lines} tml
                    ON tmmc.line_id = tml.line_id`
            console.log(q);
            await queryCustom(q).then((result) => {
                response.success(res, 'Success to get all machines', result.rows)
            })
        } catch (error) {
            response.failed(res, error)
        }
    },
}