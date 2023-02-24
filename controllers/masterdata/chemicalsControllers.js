const table = require('../../config/table')
const { queryGET, queryCustom } = require('../../helpers/query')
const response = require('../../helpers/response')


module.exports = {
    getData: async(req, res) => {
        try {
            await queryGET(table.tb_m_chemical, null)
                .then((result) => {
                    response.success(res, 'Success to get all chemicals', result)
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    },
    getDataByMachine: async(req, res) => {
        try {
            let q = `select 
	tmmche.machine_chemical_id,
	tmmche.machine_id,
	tmmche.chemical_id,
	tmc.chemical_nm,
	tmc.chemical_desc,
	tmc.price_per_liter 
from ${table.tb_m_machine_chemical} tmmche
join ${table.tb_m_chemical} tmc 
	on tmc.chemical_id = tmmche.chemical_id
WHERE machine_id = ${req.params.machine_id}`
            console.log(q);
            await queryCustom(q)
                .then((result) => {
                    response.success(res, 'Success to get all chemicals by Machine', result.rows)
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    }
}