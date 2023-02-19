const table = 'tb_m_lines'
const { queryCustom } = require('../../helpers/query')
const response = require('../../helpers/response')
module.exports = {
	getData: async (req, res) => {
		try {
			let q = `SELECT * FROM tb_m_lines WHERE parent_id IS NULL`
			let linesParentData = await queryCustom(q)
				.then((result) => {
					return result.rows
				}).catch((err) => {
					return err
				});
			let qRules = `SELECT * FROM tb_m_rules`
			let rulesData = await queryCustom(qRules)
				.then((result) => {
					return result.rows
				}).catch((err) => {
					return err
				});
			let containerCb = await async function (cb) {
				let container = []
				await linesParentData.forEach(async line => {
					await rulesData.forEach(async (rule, idxRule) => {
						let qLinesSummary = `WITH RECURSIVE sublines AS (
        SELECT
                line_id,
                parent_id,
                line_nm,
                line_desc,
                line_lvl,
                idx_pos,
                loop_by
        FROM
                tb_m_lines
        WHERE
                line_id = ${line.line_id}
        UNION
                SELECT
                        e.line_id,
                        e.parent_id,
                        e.line_nm,
                        e.line_desc,
                        e.line_lvl,
                        e.idx_pos,
                        e.loop_by
                FROM
                        tb_m_lines e
                INNER JOIN sublines s ON s.line_id = e.parent_id
) SELECT
        sublines.line_id,
        sublines.parent_id,
        sublines.line_nm,
        sublines.line_desc,
        sublines.line_lvl,
        sublines.idx_pos,
        sublines.loop_by,
        (
        	SELECT 
        		COUNT(tmmc.machine_id)
        	FROM 
        		tb_m_machines tmmc
        	LEFT JOIN tb_r_periodic_check trpc
        		ON trpc.machine_id = tmmc.machine_id
        	WHERE 
        		tmmc.line_id = sublines.line_id AND
        		trpc.maintenance_id IN (
        			SELECT 
        				tmmt.maintenance_id 
        			FROM tb_m_maintenance tmmt
        			LEFT JOIN tb_r_mt_schedules trmts
        				ON trmts.maintenance_id = tmmt.maintenance_id
        			LEFT JOIN tb_m_checksheets tmcs
        				ON tmmt.checksheet_id = tmcs.checksheet_id
        			WHERE tmmt.checksheet_id IS NOT NULL
        		) AND 
        		trpc.rule_id = ${rule.rule_id}
        	) AS machines_normal
FROM
        sublines
order by parent_id, idx_pos ASC`
						await queryCustom(qLinesSummary)
							.then(async (resSummaryLines) => {
								if (!line[rule.rules_nm]) {
									line[rule.rules_nm] = 0
								}
								await resSummaryLines.rows.forEach(lineSum => {
									line[rule.rules_nm] += +lineSum.machines_normal
								})
								if (idxRule == rulesData.length - 1) {
									// console.log(line);
									container.push(line)
									if (container.length == linesParentData.length) {
										cb(container)
									}
									// return line
								}
							})
					})
				})
				console.log(container.length);

			}
			containerCb(async resLine => {
				console.log(resLine);
				await response.success(res, 'Success to get linesSummary', resLine)
			})
			// console.log();

			// let promiseLinesSummary = await Promise.all(mapSummaryLines)
			// console.log(promiseLinesSummary);

		} catch (error) {
			console.log(error);
			response.failed(res, error)
		}
	},
}