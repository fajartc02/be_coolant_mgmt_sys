const table = require('../../config/table')
const { queryCustom } = require('../../helpers/query')
const response = require('../../helpers/response')

module.exports = {
    getData: async(req, res) => {
        try {
            let whereQuery = ``
            let whereQueryContainer = []
            if (req.query) {
                for (const key in req.query) {
                    let whereObj = {
                        column: key,
                        value: req.query[key]
                    }
                    if (key == 'tmcs.checksheet_id') {
                        if (whereObj.value == 'null') {
                            whereObj.value = 'IS NULL'
                        } else if (whereObj.value == 'not_null') {
                            whereObj.value = 'IS NOT NULL'
                        }
                    }
                    whereQueryContainer.push(whereObj)
                }
                if (whereQueryContainer.length > 0) {
                    let mapQuery = whereQueryContainer.map(queryKey => {
                        return `${queryKey.column} ${queryKey.column == 'tmcs.checksheet_id' ? '' : '= '}${queryKey.value}`
                    })
                    whereQuery = ` WHERE `
                    whereQuery += mapQuery.join(' AND ')
                }
            }
            let q = `select 
            trms.mt_schedule_id, 
            tmm.machine_id, 
            tmm.machine_nm, 
            tmmt.maintenance_id, 
            tmmt.maintenance_nm,
            tmcs.checksheet_id 
        from tb_r_mt_schedules trms 
            join tb_m_machines tmm 
                 on tmm.machine_id = trms.machine_id
            join tb_m_maintenance tmmt 
                on tmmt.maintenance_id = trms .maintenance_id
            left join tb_m_checksheets tmcs 
                on tmcs.checksheet_id = tmmt.checksheet_id
           ${whereQuery} ORDER BY machine_id ASC`
            console.log(q);
            await queryCustom(q)
                .then((result) => {
                    response.success(res, 'Success to get maintenance Schedules Machines', result.rows)
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    }
}