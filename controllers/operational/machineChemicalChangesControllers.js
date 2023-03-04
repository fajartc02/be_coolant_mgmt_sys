const table = require('../../config/table')
const attrsUserInsertData = require('../../helpers/addAttrsUserInsertData')
const attrsUserUpdateData = require('../../helpers/addAttrsUserUpdateData')
const { queryBulkPOST, queryPUT } = require('../../helpers/query')
const response = require('../../helpers/response')


module.exports = {
    postData: async(req, res) => {
        try {
            let addAttrsUserInsertData = await attrsUserInsertData(req, req.body.chemicals)
            await queryBulkPOST(table.tb_r_chemical_changes, addAttrsUserInsertData)
                .then(async result => {
                    if (result) {
                        let idPeriodCheck = req.body.periodic_check_id
                        delete req.body.chemicals
                        delete req.body.periodic_check_id
                        let addAttrsUserUpdateData = await attrsUserUpdateData(req, req.body)
                        await queryPUT(table.tb_r_periodic_check, addAttrsUserUpdateData, ` WHERE periodic_check_id = ${idPeriodCheck}`)
                            .then((result) => {
                                response.success(res, 'Success to add chemical changes AND update Periodic check', result.rows)
                            })
                    }
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    },
    checkChemical: async(req, res) => {
        try {
            let addAttrsUserInsertData = await attrsUserInsertData(req, req.body.parameters_check)
            await queryBulkPOST(table.tb_r_tasks, addAttrsUserInsertData)
                .then(async result => {
                    // response.success(res, 'Success to add task after chemical changes', result.rows)
                    let idPeriodCheck = req.body.periodic_check_id
                    delete req.body.parameters_check
                    delete req.body.periodic_check_id
                    let addAttrsUserUpdateData = await attrsUserUpdateData(req, req.body)
                    await queryPUT(table.tb_r_periodic_check, addAttrsUserUpdateData, ` WHERE periodic_check_id = ${idPeriodCheck}`)
                        .then((result) => {
                            response.success(res, 'Success to add task after chemical changes and update periodic check', result.rows)
                        })
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }

    }
}