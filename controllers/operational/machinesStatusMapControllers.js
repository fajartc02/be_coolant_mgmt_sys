const { tb_r_periodic_check } = require('../../config/table')
const table = require('../../config/table')
const { queryCustom } = require('../../helpers/query')
const response = require('../../helpers/response')

module.exports = {
    getData: async(req, res) => {
        let q = `SELECT 
    tmmc.machine_id, 
    tmmc.machine_nm, 
    tmmc.machine_desc, 
    tmmc.machine_maker, 
    tmmc.idx_pos,
    true AS is_checked_status,
	(SELECT 
    		CASE
				WHEN tpcc.start_date IS NULL THEN false
    			ELSE true
 			END 
    	FROM 
    			${table.tb_r_periodic_check} tpcc
    	JOIN ${table.tb_m_machines} tmmcc
				ON tpcc.machine_id = tmmcc.machine_id
		JOIN ${table.tb_m_maintenance} tmmtc
				ON tpcc.maintenance_id = tmmtc.maintenance_id
		WHERE 
				tpcc.machine_id = tmmc.machine_id AND 
				tmmtc.checksheet_id IS NOT NULL
    	ORDER BY tpcc.created_dt DESC LIMIT 1
    ) AS is_checked_status,
    CASE WHEN (
    	SELECT 
    		tpcc.color_status
    	FROM 
    		${table.tb_r_periodic_check} tpcc
    	JOIN ${table.tb_m_machines} tmmcc
			ON tpcc.machine_id = tmmcc.machine_id
		JOIN ${table.tb_m_maintenance} tmmtc
			ON tpcc.maintenance_id = tmmtc.maintenance_id
		WHERE 
			tpcc.machine_id = tmmc.machine_id AND 
			tmmtc.checksheet_id IS NOT NULL
    	ORDER BY tpcc.created_dt DESC LIMIT 1
    ) IS NULL THEN '#00ff90'
    ELSE (
    	SELECT 
    		tpcc.color_status
    	FROM 
    		${table.tb_r_periodic_check} tpcc
    	JOIN ${table.tb_m_machines} tmmcc
			ON tpcc.machine_id = tmmcc.machine_id
		JOIN ${table.tb_m_maintenance} tmmtc
			ON tpcc.maintenance_id = tmmtc.maintenance_id
		WHERE 
			tpcc.machine_id = tmmc.machine_id AND 
			tmmtc.checksheet_id IS NOT NULL
    	ORDER BY tpcc.created_dt DESC LIMIT 1
    ) END AS checked_color_status,
    CASE WHEN (
    	SELECT 
    		CASE
				WHEN tpcc.start_date IS NULL THEN FALSE
    			ELSE TRUE
 			END  
    	FROM 
    		${table.tb_r_periodic_check} tpcc
    	JOIN ${table.tb_m_machines} tmmcc
			ON tpcc.machine_id = tmmcc.machine_id
		JOIN ${table.tb_m_maintenance} tmmtc
			ON tpcc.maintenance_id = tmmtc.maintenance_id
		WHERE 
			tpcc.machine_id = tmmc.machine_id AND 
			tmmtc.checksheet_id IS NULL
    	ORDER BY tpcc.created_dt DESC LIMIT 1
    ) IS NULL THEN FALSE
    ELSE (
    	SELECT 
    		CASE
				WHEN tpcc.start_date IS NULL THEN TRUE
    			ELSE FALSE
 			END  
    	FROM 
    		${table.tb_r_periodic_check} tpcc
    	JOIN ${table.tb_m_machines} tmmcc
			ON tpcc.machine_id = tmmcc.machine_id
		JOIN ${table.tb_m_maintenance} tmmtc
			ON tpcc.maintenance_id = tmmtc.maintenance_id
		WHERE 
			tpcc.machine_id = tmmc.machine_id AND 
			tmmtc.checksheet_id IS NULL
    	ORDER BY tpcc.created_dt DESC LIMIT 1
    ) END AS is_chemical_changes,
    CASE 
    	WHEN (
    		SELECT 
    			CASE
					WHEN tpcc.start_date IS NULL THEN false
    				ELSE true
 				END  
    		FROM 
    			${table.tb_r_periodic_check} tpcc
    		JOIN ${table.tb_m_machines} tmmcc
				ON tpcc.machine_id = tmmcc.machine_id
			JOIN ${table.tb_m_maintenance} tmmtc
				ON tpcc.maintenance_id = tmmtc.maintenance_id
			WHERE 
				tpcc.machine_id = tmmc.machine_id AND 
				tmmtc.checksheet_id IS NULL
    		ORDER BY tpcc.created_dt DESC LIMIT 1
    	) IS NULL THEN 'Belum Waktunya di kuras'
    	WHEN (
    		SELECT 
    			CASE
					WHEN tpcc.start_date IS NULL THEN false
    				ELSE true
 				END  
    		FROM 
    			${table.tb_r_periodic_check} tpcc
    		JOIN ${table.tb_m_machines} tmmcc
				ON tpcc.machine_id = tmmcc.machine_id
			JOIN ${table.tb_m_maintenance} tmmtc
				ON tpcc.maintenance_id = tmmtc.maintenance_id
			WHERE 
				tpcc.machine_id = tmmc.machine_id AND 
				tmmtc.checksheet_id IS NULL
    		ORDER BY tpcc.created_dt DESC LIMIT 1
    	) = FALSE THEN 'Sudah Waktunya Penggantian'
    	WHEN (
    		SELECT 
    			CASE
					WHEN tpcc.start_date IS NULL THEN false
    				ELSE true
 				END  
    		FROM 
    			${table.tb_r_periodic_check} tpcc
    		JOIN ${table.tb_m_machines} tmmcc
				ON tpcc.machine_id = tmmcc.machine_id
			JOIN ${table.tb_m_maintenance} tmmtc
				ON tpcc.maintenance_id = tmmtc.maintenance_id
			WHERE 
				tpcc.machine_id = tmmc.machine_id AND 
				tmmtc.checksheet_id IS NULL
    		ORDER BY tpcc.created_dt DESC LIMIT 1
    	) = TRUE THEN 'Sudah Dilakukan Penggantian Coolant'
    END AS chemical_changes_msg
FROM 
        ${table.tb_m_machines} tmmc 
WHERE 
        tmmc.line_id = ${req.params.line_id} 
ORDER BY 
        tmmc.idx_pos 
ASC`
        console.log(q);
        await queryCustom(q)
            .then((result) => {
                response.success(res, 'Success to get Machines Status Map', result.rows)
            }).catch((err) => {
                console.log(err);
                response.failed(res, err)
            });
    }
}