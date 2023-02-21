const table = require('../../config/table')
const { queryCustom } = require('../../helpers/query')
const response = require('../../helpers/response')


module.exports = {
    getChecksheetList: async(req, res) => {
        try {
            let q = `SELECT 
	trpcp.periodic_check_id,
	trpcp.maintenance_id,
	tmmcp.machine_id,
	tmmcp.machine_nm,
	tbmmtp.maintenance_nm,
	subchecksheet.*
FROM 
	tb_r_periodic_check trpcp
JOIN 
	tb_m_maintenance tbmmtp
	ON trpcp.maintenance_id = tbmmtp.maintenance_id
JOIN 
	tb_m_machines tmmcp
	ON tmmcp.machine_id = trpcp.machine_id
LEFT JOIN 
	(
		SELECT 
			tmcspc.checksheet_id,
			tmcspc.checksheet_nm,
			tmparc.param_id,
			tmparc.param_nm,
            tmcpc.check_param_id,
			tmoptc.option_id,
			tmoptc.opt_nm,
			tmoptrc.ranged_id,
			tmoptrc.min_value,
			tmoptrc.max_value,
			tmrc.rule_id,
			tmrc.rules_nm,
			tmrc.rule_lvl
		FROM 
			tb_m_checksheets tmcspc
		JOIN 
			tb_m_check_params tmcpc
			ON tmcspc.checksheet_id = tmcpc.checksheet_id
		JOIN 
			tb_m_parameters tmparc
			ON tmparc.param_id = tmcpc.param_id
		JOIN 
			tb_m_options tmoptc
			ON tmoptc.param_id = tmparc.param_id
		LEFT JOIN 
			tb_m_options_ranged tmoptrc
			ON tmoptrc.option_id = tmoptc.option_id
		LEFT JOIN 
			tb_m_rules tmrc
			ON tmrc.rule_id = tmoptc.rule_id
	) AS subchecksheet
	ON subchecksheet.checksheet_id = tbmmtp.checksheet_id
-- GROUP BY subchecksheet.param_id,tmmcp.machine_id
where tmmcp.machine_id = ${req.params.machine_id} AND
subchecksheet.checksheet_id IS NOT NULL`
            await queryCustom(q)
                .then(async(result) => {
                    let containerChecksheet = []
                    await result.rows.forEach((item, i) => {
                        let findChecksheet = containerChecksheet.find(cs => cs.checksheet_id === item.checksheet_id)
                        let obj;
                        if (!findChecksheet) {
                            obj = {
                                periodic_check_id: item.periodic_check_id,
                                maintenance_id: item.maintenance_id,
                                checksheet_id: item.checksheet_id,
                                machine_id: item.machine_id,
                                machine_nm: item.machine_nm,
                                maintenance_nm: item.maintenance_nm,
                                check_param_id: item.check_param_id,
                                parameters: [{ param_id: item.param_id, param_nm: item.param_nm, options: [{ option_id: item.option_id, opt_nm: item.opt_nm, min_value: item.min_value, max_value: item.max_value, rule_id: item.rule_id, rules_nm: item.rules_nm, rule_lvl: item.rule_lvl }] }]
                            }
                            containerChecksheet.push(obj)
                        } else {
                            console.log(findChecksheet);
                            console.log(item);
                            let findParameter = findChecksheet.parameters.find(param => param.param_id === item.param_id)
                            console.log('PARAM FIND');
                            console.log(findParameter);
                            if (!findParameter) {
                                console.log('masuk undi');
                                findChecksheet.parameters.push({ param_id: item.param_id, param_nm: item.param_nm, options: [{ option_id: item.option_id, opt_nm: item.opt_nm, min_value: item.min_value, max_value: item.max_value, rule_id: item.rule_id, rules_nm: item.rules_nm, rule_lvl: item.rule_lvl }] })
                            } else {
                                findParameter.options.push({ option_id: item.option_id, opt_nm: item.opt_nm, min_value: item.min_value, max_value: item.max_value, rule_id: item.rule_id, rules_nm: item.rules_nm, rule_lvl: item.rule_lvl })
                            }
                        }
                        // return containerChecksheet
                    })
                    response.success(res, 'success', containerChecksheet)
                        // console.log(mapRes);
                })
        } catch (error) {
            console.log(error);
            response.error(res, error)
        }

    }
}