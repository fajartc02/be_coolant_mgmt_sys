const { queryCustom } = require('../../helpers/query')

const response = require('../../helpers/response')

module.exports = {
    getGraphData: async(req, res) => {
        try {
            let q = `select 
        tmm.machine_id,
        tmm.root_line_id,
        tml.line_nm,
        tmm.line_id,
        tmm.machine_nm,
        case 
            when subperiodic.cost_chemical is null then 0
            else ROUND(subperiodic.cost_chemical)
        end as cost_chemical,
        case 
            when subperiodic.cost_mh is null then 0
            else ROUND(subperiodic.cost_mh)
        end as cost_mh
    from tb_m_machines tmm 
    join tb_m_lines tml 
        on tml.line_id = tmm.root_line_id 
    left join (
        select 
            trpc.periodic_check_id,
            trpc.machine_id,
            trpc.start_date,
            trpc.finish_date,
            sum(trcc.cost_chemical) as cost_chemical,
            (((DATE_PART('day', trpc.finish_date::timestamp - trpc.start_date::timestamp) * 24 + 
            DATE_PART('hour', trpc.finish_date::timestamp - trpc.start_date::timestamp)) * 60 +
            DATE_PART('minute', trpc.finish_date::timestamp - trpc.start_date::timestamp)) / 60) * (select tmmh.price_per_hour from tb_m_man_hour tmmh where tmmh.is_active = true)
            as cost_mh,
            trpc.created_dt
        from tb_r_periodic_check trpc
        join tb_r_checmical_changes trcc 
            on	trcc.periodic_check_id = trpc.periodic_check_id
        where trpc.created_dt between '${req.query.start}' and '${req.query.end}'
        group by trpc.periodic_check_id
    ) as subperiodic
        on subperiodic.machine_id = tmm.machine_id
    order by tmm.machine_id ASC
    `
            await queryCustom(q)
                .then(async result => {
                    console.log(result);
                    let containerArr = []
                    await result.rows.map(item => {
                        let findLine = containerArr.find(line => line.line_id == item.root_line_id)
                        let objMc = {
                            machine_id: item.machine_id,
                            machine_nm: item.machine_nm,
                            cost_chemical: +item.cost_chemical,
                            cost_mh: +item.cost_mh
                        }
                        if (!findLine) {
                            let objLine = {
                                line_id: item.root_line_id,
                                line_nm: item.line_nm,
                                sum_cost_chemical: +item.cost_chemical,
                                sum_cost_mh: +item.cost_mh,
                                machines: [objMc]
                            }
                            containerArr.push(objLine)
                        } else {
                            findLine.sum_cost_chemical += +item.cost_chemical
                            findLine.sum_cost_mh += +item.cost_mh
                            findLine.machines.push(objMc)
                        }
                    })
                    response.success(res, 'success to get graph cost calculation', containerArr)
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    }
}