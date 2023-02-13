const table = 'tb_m_machines'
const { queryCustom } = require('../../helpers/query')
const response = require('../../helpers/response')

module.exports = {
    getData: async (req, res) => {
        let q = `SELECT 
	tmmc.machine_id, 
	tmmc.machine_nm, 
	tmmc.machine_desc, 
	tmmc.machine_maker, 
	tmmc.idx_pos,
    true AS is_checked_status,
    ('#00ff90') AS color_status,
    ('Normal') AS checked_status,
    false AS is_changes_checmical_status,
    ('Belum Waktunya Pengurasan') AS changes_checmical_status
FROM 
	${table} tmmc 
WHERE 
	line_id = ${req.params.line_id} 
ORDER BY 
	idx_pos 
ASC`
        await queryCustom(q)
            .then((result) => {
                response.success(res, 'Success to get Machines Status Map', result.rows)
            }).catch((err) => {
                console.log(err);
                response.failed(res, err)
            });
    }
}