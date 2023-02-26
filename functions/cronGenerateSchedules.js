const { queryGET, queryPOST, queryCustom } = require('../helpers/query')
const tb_r_mt_schedules = 'tb_r_mt_schedules'
const tb_r_periodic_check = 'tb_r_periodic_check'
const tb_m_machines = 'tb_m_machines'
const tb_m_periodic = 'tb_m_periodic'
const tb_m_maintenance = 'tb_m_maintenance'

const tb_r_cron_log = 'tb_r_cron_log'

async function cronGenerateSchedules() {
    try {
        let q = `SELECT
	tmmtp.maintenance_id,
    trmts.mt_schedule_id,
    trmts.periodic_val,
	tmmtp.maintenance_nm, 
	tmper.periodic_nm,
	tmper.periodic_precision,
	tmmc.machine_id,
	tmmc.machine_nm
FROM 
	${tb_r_mt_schedules} trmts
JOIN ${tb_m_machines} tmmc
	ON tmmc.machine_id = trmts.machine_id
JOIN ${tb_m_periodic} tmper
	ON tmper.periodic_id = trmts.periodic_id
JOIN ${tb_m_maintenance} tmmtp
	ON tmmtp.maintenance_id = trmts.maintenance_id`
        await queryCustom(q)
            .then(async(result) => {
                let resData = result.rows
                if (resData.length > 0) {
                    console.log(resData);
                    let mapDataCheck = await resData.map(async itm => {
                        console.log(itm);
                        return await {
                            ...itm,
                            is_tr_avail: await checkTransactionGenerate(itm.machine_id, itm.maintenance_id, itm.periodic_precision * itm.periodic_val, itm.mt_schedule_id)
                        }
                    })
                    let resWaitPromise = await Promise.all(mapDataCheck)
                    let set7Clock = new Date().setHours(7, 0, 0) + (7 * 60 * 60 * 1000)
                    let created_dt = new Date(set7Clock).toISOString()
                    resWaitPromise.forEach((item, i) => {
                            // 
                            if (item.is_tr_avail) {
                                // PERIODIC CHECK ALREADY GENERATE 
                                // DO NOTHING
                            } else {
                                // CREATE PERIODIC CHECK
                                console.log(item);
                                insertPeriodicForCheck(item.machine_id, item.maintenance_id, created_dt, item.mt_schedule_id)
                            }
                            if (i + 1 == resWaitPromise.length) {
                                // CREATE LOG CRON ONLY 1 ALREADY GENERATE
                                queryPOST(tb_r_cron_log, { msg: `Success to RUN CRON 1 CYCLE`, status_msg: 'SUCCESS' })
                            }
                        })
                        // console.log(resWaitPromise);
                } else {
                    console.log('DATA NOT FOUND');
                    queryPOST(tb_r_cron_log, { msg: `MT Schedules NOT FOUND`, status_msg: 'SUCCESS' })
                }
            })
    } catch (error) {
        console.log(error);
        queryPOST(tb_r_cron_log, { msg: `Error Cron RUN at fn cronGenerateSchedules()`, status_msg: 'ERROR' })
    }

}


async function checkTransactionGenerate(machine_id, maintenance_id, periodic_calculate, mt_schedule_id) {
    // if EXTRACT(EPOCH FROM (created_dt - NOW())) AS days_diff

    return await queryGET(tb_r_periodic_check, ` WHERE machine_id = ${machine_id} AND maintenance_id = ${maintenance_id} AND mt_schedule_id = ${mt_schedule_id} AND start_date IS NULL ORDER BY created_dt DESC LIMIT 1`, ['machine_id', 'maintenance_id', `DATE_PART('day', NOW() - created_dt) AS days_diff`])
        .then((result) => {
            let is_avail = result.length > 0
            if (is_avail) {
                let is_avail_time_diff = +result[0].days_diff < periodic_calculate
                if (is_avail_time_diff) return true
                return false
            } else {
                return false
            }
        }).catch((err) => {
            console.log(err);
            queryPOST(tb_r_cron_log, { msg: `Error Cron RUN at fn checkTransactionGenerate()`, status_msg: 'ERROR' })
        });
}

async function insertPeriodicForCheck(machine_id, maintenance_id, created_dt, mt_schedule_id) {
    console.log(created_dt);
    let convStrDate = String(created_dt)
    let formaterDate = `${convStrDate.split('T')[0]} ${convStrDate.split('T')[1].split('.')[0]}`
    await queryPOST(tb_r_periodic_check, { machine_id, maintenance_id, created_dt: formaterDate, changed_dt: formaterDate, mt_schedule_id })
        .then((result) => {
            console.log(result);

        }).catch((err) => {
            console.log(err);
            queryPOST(tb_r_cron_log, { msg: `Error Cron RUN at fn insertPeriodicForCheck()`, status_msg: 'ERROR' })
        });
}



module.exports = cronGenerateSchedules