const table = require('../../config/table')
const attrsUserInsertData = require('../../helpers/addAttrsUserInsertData')
const attrsUserUpdateData = require('../../helpers/addAttrsUserUpdateData')
const { queryCustom, queryGET, queryBulkPOST, queryPUT } = require('../../helpers/query')
const response = require('../../helpers/response')


module.exports = {
    getChecksheetList: async(req, res) => {
        try {
            let q = `select
	distinct trpcp.periodic_check_id,
	trpcp.maintenance_id,
	tmmcp.machine_id,
	tmmcp.machine_nm,
	tbmmtp.maintenance_nm,
	subchecksheet.*,
	subtask.*
FROM 
	tb_r_periodic_check trpcp
left join tb_r_tasks trt 
	on trpcp.periodic_check_id = trt.periodic_check_id 
JOIN 
	tb_m_maintenance tbmmtp
	ON trpcp.maintenance_id = tbmmtp.maintenance_id
JOIN 
	tb_m_machines tmmcp
	ON tmmcp.machine_id = trpcp.machine_id
JOIN 
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
            tmparc.units,
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
left join (
	select 
		trt2.task_id,
    	trt2.task_value,
   		trt2.task_status,
    	trt2.param_id as task_param_id,
    	trt2.option_id as task_opt_id,
    	tmr2.rules_nm,
    	tmr2.rule_lvl,
    	tmr2.color 
	from tb_r_tasks trt2
	 join tb_m_rules tmr2
	 	on tmr2.rule_id = trt2.rule_id 
	where trt2.is_evaluate = false
) AS subtask 
	on subchecksheet.option_id = subtask.task_opt_id 
where tmmcp.machine_id = ${req.params.machine_id} AND
subchecksheet.checksheet_id IS NOT null and
trpcp.periodic_check_id =  (
	select max(trpcc.periodic_check_id) 
	from tb_r_periodic_check trpcc 
	where tbmmtp.maintenance_id = trpcc.maintenance_id and
	trpcc.machine_id =tmmcp.machine_id 
	)
order by trpcp.periodic_check_id;
`
            await queryCustom(q)
                .then(async(result) => {
                    let containerChecksheet = []
                    await result.rows.forEach((item, i) => {
                        let findChecksheet = containerChecksheet.find(cs => cs.checksheet_id === item.checksheet_id)
                        let obj;
                        let objOpt = {
                            option_id: item.option_id,
                            opt_nm: item.opt_nm,
                            min_value: item.min_value,
                            units: item.units,
                            max_value: item.max_value,
                            rule_id: item.rule_id,
                            rules_nm: item.rules_nm,
                            rule_lvl: item.rule_lvl,
                            selected_opt: (item.task_opt_id && !item.is_evaluate) ? true : false
                        }
                        if (!findChecksheet) {
                            obj = {
                                periodic_check_id: item.periodic_check_id,
                                maintenance_id: item.maintenance_id,
                                checksheet_id: item.checksheet_id,
                                machine_id: item.machine_id,
                                machine_nm: item.machine_nm,
                                maintenance_nm: item.maintenance_nm,
                                check_param_id: item.check_param_id,
                                parameters: [{ param_id: item.param_id, param_nm: item.param_nm, options: [objOpt] }]
                            }
                            containerChecksheet.push(obj)
                        } else {
                            let findParameter = findChecksheet.parameters.find(param => param.param_id === item.param_id)
                                // console.log(item);
                            if (!findParameter) {
                                findChecksheet.parameters.push({ param_id: item.param_id, param_nm: item.param_nm, options: [objOpt] })
                            } else {
                                findParameter.options.push(objOpt)
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
    },
    getMaintenanceMachine: async(req, res) => {
        try {
            let q = `select trpcp.periodic_check_id ,trmsp.mt_schedule_id,tmmp.machine_id,tmmp.machine_nm, trmsp.maintenance_id,tmmt.maintenance_nm, trpcp.start_date  from tb_m_machines tmmp
	join tb_r_mt_schedules trmsp 
		on tmmp.machine_id = trmsp.machine_id
	join tb_m_maintenance tmmt
		on tmmt.maintenance_id = trmsp.maintenance_id
	left join tb_r_periodic_check trpcp 
		on trmsp.mt_schedule_id = trpcp.mt_schedule_id
where 
	trmsp.machine_id = ${req.params.machine_id} and 
	trpcp.created_dt between '${req.query.start_date}' and '${req.query.end_date}'`
                // '2023-02-27 07:00:00' AND '2023-02-28 06:00:00'
            await queryCustom(q)
                .then((result) => {
                    if (result.rows.length > 0) return response.success(res, 'Success to get check Maintenance Machine', result.rows)
                    return response.success(res, 'No maintenance for this machine', result.rows)
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    },
    getMtMachineChecksheet: async(req, res) => {
        try {
            let q = `select 
	trpc.periodic_check_id,
	trpc.machine_id,
	tmm.machine_nm ,
	trpc.start_date,
	trpc.finish_date,
	trpc.pic as pic_id,
	tmu."name" ,
	tmu.group_id,
	tmg.group_nm,
	tmmt.maintenance_id,
	tmmt.maintenance_nm,
	tmcs.checksheet_id,
	trpc.checksheet_id as ref_checksheet_id,
	trpc.notes
from tb_r_periodic_check trpc 
left join tb_m_users tmu 
	ON tmu.user_id = trpc.pic
left join tb_m_group tmg 
	ON tmg.group_id  = tmu.group_id
left join tb_m_maintenance tmmt 
	on tmmt.maintenance_id = trpc.maintenance_id
left join tb_m_checksheets tmcs 
	on tmcs.checksheet_id = tmmt.checksheet_id
left join tb_m_machines tmm 
	on tmm.machine_id = trpc.machine_id 
where trpc.periodic_check_id = ${req.params.periodic_check_id}`
            await queryCustom(q)
                .then(async resultParent => {
                    let rawResultParent = resultParent.rows[0]
                    let headerDataObj = {
                        periodic_check_id: rawResultParent.periodic_check_id,
                        maintenance_id: rawResultParent.maintenance_id,
                        maintenance_nm: rawResultParent.maintenance_nm,
                        machine_id: rawResultParent.machine_id,
                        machine_nm: rawResultParent.machine_nm,
                        start_date: rawResultParent.start_date,
                        finish_date: rawResultParent.finish_date,
                        pic: rawResultParent.pic_id,
                        pic_nm: rawResultParent.name,
                        group: rawResultParent.group_id,
                        group_nm: rawResultParent.group_nm,
                        checksheet_id: rawResultParent.checksheet_id,
                        notes: rawResultParent.notes
                    }
                    let qDetailTask = `select
	trpcp.periodic_check_id,
	trpcp.maintenance_id,
	tmmcp.machine_id,
	tmmcp.machine_nm,
	tbmmtp.maintenance_nm,
	subchecksheet.*,
	subtask.task_id,
	subtask.task_value,
	subtask.task_status,
	subtask.is_evaluate,
	task_param_id,
	task_opt_id
FROM 
	tb_r_periodic_check trpcp
left join tb_r_tasks trt 
	on trpcp.periodic_check_id = trt.periodic_check_id 
JOIN 
	tb_m_maintenance tbmmtp
	ON trpcp.maintenance_id = tbmmtp.maintenance_id
JOIN 
	tb_m_machines tmmcp
	ON tmmcp.machine_id = trpcp.machine_id
JOIN 
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
            tmparc.units,
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
		ORDER BY tmrc.rule_lvl ASC
	) AS subchecksheet
	ON subchecksheet.checksheet_id = tbmmtp.checksheet_id
left join (
	select 
		trt2.task_id,
    	trt2.task_value,
   		trt2.task_status,
    	trt2.param_id as task_param_id,
    	trt2.option_id as task_opt_id,
    	tmr2.rules_nm as task_rule_nm,
    	tmr2.rule_lvl as task_rules_lvl,
    	tmr2.color as task_rules_color,
		trt2.is_evaluate,
		trt2.parent_task_id
	from tb_r_tasks trt2
	 join tb_r_periodic_check trpcc
	 	on trpcc.periodic_check_id = trt2.periodic_check_id
	 left join tb_m_rules tmr2
	 	on trt2.rule_id = tmr2.rule_id
	 where trpcc.periodic_check_id = ${req.params.periodic_check_id} and trt2.is_evaluate = false
	 order by trt2.created_dt DESC
) AS subtask 
	on subchecksheet.option_id = subtask.task_opt_id 
where tmmcp.machine_id = ${req.query.machine_id} AND
subchecksheet.checksheet_id IS NOT null and
trpcp.periodic_check_id = ${req.params.periodic_check_id} AND
subtask.parent_task_id is null`
                    qDetailTask += `;select 
	tmmc.machine_chemical_id, 
	tmmc.machine_id, 
	tmm.machine_nm, 
	tmmc.chemical_id, 
	tmc.chemical_nm, 
	tmc.price_per_liter  
from tb_m_machine_chemical tmmc 
	join tb_m_chemical tmc 
 		on tmc.chemical_id = tmmc.chemical_id 
 	join tb_m_machines tmm 
 		on tmm.machine_id = tmmc.machine_id 
where tmmc.machine_id = ${req.query.machine_id};select 
	trpc.periodic_check_id,
	trpc.machine_id,
	tmm.machine_nm ,
	trpc.start_date,
	trpc.finish_date,
	trpc.pic as pic_id,
	tmu."name" ,
	tmu.group_id,
	tmg.group_nm,
	tmmt.maintenance_id,
	tmmt.maintenance_nm,
	tmc.chemical_id,
	tmc.chemical_nm,
	trcc.chemical_change_id,
	trcc.chemical_id as changes_checmical_id,
	trcc.vol_changes,
	trcc.cost_chemical
from 
	tb_r_periodic_check trpc
left join tb_r_checmical_changes trcc ON trpc.periodic_check_id = trcc.periodic_check_id
left join tb_m_maintenance tmmt 
	on tmmt.maintenance_id = trpc.maintenance_id
left join tb_m_machine_chemical tmmc on tmmc.machine_id = trpc.machine_id
left join tb_m_chemical tmc on tmc.chemical_id = tmmc.chemical_id 
left join tb_m_machines tmm on tmm.machine_id = trpc.machine_id 
left join tb_m_users tmu ON tmu.user_id = trpc.pic
left join tb_m_group tmg 
	ON tmg.group_id  = tmu.group_id
where trpc.machine_id = ${req.query.machine_id} and trpc.periodic_check_id = ${req.params.periodic_check_id} and trcc.chemical_id = tmc.chemical_id;
select * from tb_r_tasks where periodic_check_id = ${req.params.periodic_check_id}`
                    let ref_checksheet_id = rawResultParent.ref_checksheet_id
                    qDetailTask += `;SELECT 
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
						tmparc.units,
						tmrc.rule_id,
						tmrc.rules_nm,
						tmrc.rule_lvl,
						subtask.*
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
			left join (
				select 
					trt2.task_id,
					trt2.task_value,
					trt2.task_status,
					trt2.param_id as task_param_id,
					trt2.option_id as task_opt_id,
					tmr2.rules_nm as task_rule_nm,
					tmr2.rule_lvl as task_rules_lvl,
					tmr2.color as task_rules_color,
					trt2.is_evaluate
				from tb_r_tasks trt2
				 join tb_r_periodic_check trpcc
					 on trpcc.periodic_check_id = trt2.periodic_check_id
				 left join tb_m_rules tmr2
					 on trt2.rule_id = tmr2.rule_id
				 where trpcc.periodic_check_id = ${req.params.periodic_check_id} and trt2.is_evaluate = false and trt2.parent_task_id IS NULL
				 order by trt2.created_dt DESC
			) AS subtask 
				on tmoptc.option_id = subtask.task_opt_id 
			where tmcspc.checksheet_id = ${ref_checksheet_id} ORDER BY tmparc.param_id,subtask.task_rules_lvl ASC;
			select trcc.*, tmc.chemical_nm from tb_r_checmical_changes trcc
			join tb_m_chemical tmc 
				on tmc.chemical_id = trcc.chemical_id
			where trcc.tasks_id is not null and trcc.periodic_check_id = ${req.params.periodic_check_id}`
                    await queryCustom(qDetailTask)
                        .then(async resultCs => {
                            // console.log(resultCs[0]);//parameters check data
                            // console.log(resultCs[1].rows); //chemical list used in machines
                            // console.log(resultCs[2]); //chemical changes data
                            // console.log(resultCs[4]); // parameter check after changes
                            // console.log(resultCs[5]); // chemical changes evaluation
                            if (resultCs[5].rows.length > 0) {
                                console.log(resultCs[5].rows);
                                let containerTasksId = resultCs[5].rows[0].tasks_id
                                let containerEvalParams = []
                                    // for prepare always checking when parameter still NG
                                let mapEvalTask = await containerTasksId.map(async taskId => {
                                        let qTaskEval = `WITH RECURSIVE subtasks AS (
										SELECT
										 task_id,
										 task_value,
										 task_status,
										 param_id,
										 option_id,
										 rule_id,
										 parent_task_id,
										 is_evaluate 
									  FROM
										  tb_r_tasks trt 
									  WHERE
										   periodic_check_id = ${req.params.periodic_check_id} and (task_id = ${taskId} or parent_task_id = ${taskId})
									  UNION
										  SELECT
											  e.task_id,
											  e.task_value,
											  e.task_status,
											  e.param_id,
											  e.option_id,
											  e.rule_id,
											  e.parent_task_id,
											  e.is_evaluate 
										  FROM
											  tb_r_tasks e
										  INNER JOIN subtasks s ON s.task_id = e.parent_task_id 
									  ) SELECT
										  subtasks.task_id,
										  subtasks.parent_task_id,
										  subtasks.task_value,
										  subtasks.task_status,
										  subtasks.param_id,
										  tmp.param_nm,
										  subtasks.option_id,
										  subtasks.rule_id,
										  subtasks.is_evaluate 
									  FROM
									  subtasks
									  join tb_m_parameters tmp ON tmp.param_id = subtasks.param_id
									  order by parent_task_id,task_id ASC`
                                        return await queryCustom(qTaskEval)
                                            .then(resTaskEval => {
                                                // console.log(resTaskEval.rows);
                                                if (resTaskEval.rows.length > 0) {
                                                    function BuildChild(data, currentChild) {
                                                        //Creating current child object
                                                        var child = {};
                                                        child.task_id = currentChild.task_id;
                                                        child.task_value = currentChild.task_value;
                                                        child.task_status = currentChild.task_status
                                                        child.param_id = currentChild.param_id
                                                        child.param_nm = currentChild.param_nm
                                                        child.option_id = currentChild.option_id
                                                        child.rule_id = currentChild.rule_id
                                                        child.parent_task_id = currentChild.parent_task_id
                                                        child.is_evaluate = currentChild.is_evaluate

                                                        child.children = [];

                                                        //Looking for childrens in all input data
                                                        var currentChildren = data.filter(item => item.parent_task_id == child.task_id);
                                                        if (currentChildren.length > 0) {
                                                            currentChildren.forEach(function(item) {
                                                                //Iterating threw children and calling the recursive function
                                                                //Adding the result to our current children
                                                                child.children.push(BuildChild(data, item));
                                                            });
                                                        }
                                                        return child;
                                                    }
                                                    // containerEvalParams.push()
                                                    return BuildChild(resTaskEval.rows, resTaskEval.rows.find(child => child.parent_task_id == null))
                                                }
                                                // console.log(containerEvalParams);
                                                return containerEvalParams
                                            })
                                    })
                                    // console.log(mapEvalTask);
                                var waitPromiseEvalTask = await Promise.all(mapEvalTask)
                                    // console.log(waitPromiseEvalTask);
                            }
                            if (rawResultParent.checksheet_id) {
                                let containerChecksheet = []
                                await resultCs[0].rows.forEach((item, i) => {
                                    let findChecksheet = containerChecksheet.find(cs => cs.checksheet_id === item.checksheet_id)
                                    let obj;

                                    let objOpt = {
                                            option_id: item.option_id,
                                            opt_nm: item.opt_nm,
                                            min_value: item.min_value,
                                            units: item.units,
                                            max_value: item.max_value,
                                            rule_id: item.rule_id,
                                            rules_nm: item.rules_nm,
                                            rule_lvl: item.rule_lvl,
                                            task_value: item.task_value,
                                            task_status: item.task_status,
                                            selected_opt: (item.task_opt_id && !item.is_evaluate) ? true : false
                                        }
                                        // console.log(objOpt);
                                    if (!findChecksheet) {
                                        obj = {
                                            ...headerDataObj,
                                            periodic_check_id: item.periodic_check_id,
                                            check_param_id: item.check_param_id,
                                            chemicals: resultCs[1].rows,
                                            chemical_changes: resultCs[2].rows,
                                            chemical_check: [{ param_id: item.param_id, param_nm: item.param_nm, options: [objOpt] }],
                                            parameter_evaluate: {
                                                chemical_changes: resultCs[5].rows,
                                                param_check: waitPromiseEvalTask
                                            }
                                        }
                                        containerChecksheet.push(obj)
                                    } else {
                                        let findParameter = findChecksheet.chemical_check.find(param => param.param_id === item.param_id)

                                        if (!findParameter) {
                                            findChecksheet.chemical_check.push({ param_id: item.param_id, param_nm: item.param_nm, options: [objOpt] })
                                        } else {
                                            let findOptions = findParameter.options.find(opt => opt.option_id === item.option_id)
                                            if (!findOptions) {
                                                findParameter.options.push(objOpt)
                                            }
                                        }
                                    }
                                })
                                return response.success(res, 'Success to get checksheet task', containerChecksheet)
                            }


                            let containerChecksheet = []
                            await resultCs[4].rows.forEach((item) => {
                                let findChecksheet = containerChecksheet.find(cs => cs.checksheet_id === item.checksheet_id)
                                let obj;
                                let objOpt = {
                                    option_id: item.option_id,
                                    opt_nm: item.opt_nm,
                                    min_value: item.min_value,
                                    units: item.units,
                                    max_value: item.max_value,
                                    rule_id: item.rule_id,
                                    rules_nm: item.rules_nm,
                                    rule_lvl: item.rule_lvl,
                                    task_value: item.task_value,
                                    task_status: item.task_status,
                                    selected_opt: (item.task_opt_id && !item.is_evaluate) ? true : false
                                }
                                if (!findChecksheet) {
                                    obj = {
                                        periodic_check_id: item.periodic_check_id,
                                        check_param_id: item.check_param_id,
                                        checksheet_id: item.checksheet_id,
                                        parameters: [{ param_id: item.param_id, param_nm: item.param_nm, options: [objOpt] }]
                                    }
                                    containerChecksheet.push(obj)
                                } else {
                                    let findParameter = findChecksheet.parameters.find(param => param.param_id === item.param_id)

                                    if (!findParameter) {
                                        findChecksheet.parameters.push({ param_id: item.param_id, param_nm: item.param_nm, options: [objOpt] })
                                    } else {
                                        let findOptions = findParameter.options.find(opt => opt.option_id === item.option_id)
                                        if (!findOptions) {
                                            findParameter.options.push(objOpt)
                                        }
                                    }
                                }
                                // return containerChecksheet
                            })
                            let resObjChemical = {
                                ...headerDataObj,
                                chemicals: resultCs[1].rows,
                                chemical_changes: resultCs[2].rows,
                                chemical_check: containerChecksheet,
                                parameter_evaluate: {
                                    chemical_changes: resultCs[5].rows,
                                    param_check: waitPromiseEvalTask
                                }
                            }
                            return response.success(res, 'success to get chemical task', resObjChemical)
                        })
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }

    },
    getChecksheetTask: async(req, res) => {
        try {
            let q = `select 
				tmmt.maintenance_id,
				tmmt.maintenance_nm,
				trms.mt_schedule_id,
				subchecksheet.*,
				subtask.*
			from tb_m_maintenance tmmt
			join
				tb_r_mt_schedules trms 
				on trms.maintenance_id = tmmt.maintenance_id 
			JOIN 
				tb_m_machines tmm
				ON tmm.machine_id = trms.machine_id
				JOIN 
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
						tmparc.units,
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
					ORDER BY tmrc.rule_lvl ASC
				) AS subchecksheet
				ON subchecksheet.checksheet_id = tmmt.checksheet_id
			left join (
				select 
					trt2.task_id,
					trt2.task_value,
					trt2.task_status,
					trt2.param_id as task_param_id,
					trt2.option_id as task_opt_id,
					tmr2.rules_nm as task_rule_nm,
    				tmr2.rule_lvl as task_rules_lvl,
    				tmr2.color as task_rules_color,
					tmr2.created_dt 
				from tb_r_tasks trt2
				join tb_m_rules tmr2
					on tmr2.rule_id = trt2.rule_id
				where trt2.periodic_check_id = (
					select trpc.periodic_check_id 
					from tb_r_periodic_check trpc
					where trpc.periodic_check_id = ${req.query.periodic_check_id}
				)
			) AS subtask 
				on subchecksheet.option_id = subtask.task_opt_id
			where tmm.machine_id = ${req.query.machine_id} and subchecksheet.checksheet_id = ${req.query.checksheet_id}`
            await queryCustom(q)
                .then(async result => {
                    let containerChecksheet = []
                    await result.rows.forEach((item, i) => {
                        let findChecksheet = containerChecksheet.find(cs => cs.checksheet_id === item.checksheet_id)
                        let obj;
                        let objOpt = {
                            option_id: item.option_id,
                            opt_nm: item.opt_nm,
                            min_value: item.min_value,
                            units: item.units,
                            max_value: item.max_value,
                            rule_id: item.rule_id,
                            rules_nm: item.rules_nm,
                            rule_lvl: item.rule_lvl,
                            selected_opt: (item.task_opt_id && !item.is_evaluate) ? true : false
                        }
                        if (!findChecksheet) {
                            obj = {
                                periodic_check_id: item.periodic_check_id,
                                maintenance_id: item.maintenance_id,
                                checksheet_id: item.checksheet_id,
                                machine_id: item.machine_id,
                                machine_nm: item.machine_nm,
                                maintenance_nm: item.maintenance_nm,
                                check_param_id: item.check_param_id,
                                parameters: [{ param_id: item.param_id, param_nm: item.param_nm, options: [objOpt] }]
                            }
                            containerChecksheet.push(obj)
                        } else {
                            let findParameter = findChecksheet.parameters.find(param => param.param_id === item.param_id)
                                // console.log(item);
                            if (!findParameter) {
                                findChecksheet.parameters.push({ param_id: item.param_id, param_nm: item.param_nm, options: [objOpt] })
                            } else {
                                findParameter.options.push(objOpt)
                            }
                        }
                        // return containerChecksheet
                    })
                    response.success(res, 'success to get maintenance checksheet', containerChecksheet)
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }

    },
    postData: async(req, res) => {
        try {
            let addAttrsUserInsertData = await attrsUserInsertData(req, req.body.parameters_check)
            await queryBulkPOST(table.tb_r_tasks, addAttrsUserInsertData)
                .then(async resultParent => {
                    if (resultParent) {
                        let idPeriodCheck = req.body.periodic_check_id
                        delete req.body.parameters_check
                        delete req.body.periodic_check_id
                        let addAttrsUserUpdateData = await attrsUserUpdateData(req, req.body)
                        await queryPUT(table.tb_r_periodic_check, addAttrsUserUpdateData, ` WHERE periodic_check_id = ${idPeriodCheck}`)
                            .then((result) => {
                                response.success(res, 'Success to add chemical changes AND update Periodic check', resultParent.rows)
                            })
                    }
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    }
}