const table = 'tb_m_lines'
const { queryGET, queryPOST, queryBulkPOST } = require('../../helpers/query')
const response = require('../../helpers/response')
module.exports = {
    getData: async(req, res) => {
        try {
            await queryGET(table, `WHERE line_lvl = 'LINE'`).then((result) => {
                response.success(res, 'Success to get all lines', result)
            })
        } catch (error) {
            response.failed(res, error)
        }
    },
    postData: async(req, res) => {
        try {
            let objLine = null
            let containerArea = []
            let containerCell = []
            let isAreaWithoutCell = req.body.childs ? req.body.childs[0].line_lvl == "AREA" && !req.body.childs[0].childs : false
            let isAreaWithCell = req.body.childs ? req.body.childs[0].line_lvl == "AREA" && req.body.childs[0].childs ? true : false : false
            let isCellWithoutArea = req.body.childs ? req.body.childs[0].line_lvl == "CELL" && !req.body.childs[0].childs : false
            console.log(req.body);
            objLine = {
                ...req.body
            }
            delete objLine.childs
            console.log('isCellWithoutArea');
            console.log(isCellWithoutArea);
            console.log('isAreaWithoutCell');
            console.log(isAreaWithoutCell);
            if (isAreaWithoutCell || isCellWithoutArea) {
                containerArea = req.body.childs
                console.log(containerArea);
            }
            console.log('isAreaWithCell');
            // console.log(req.body.childs[0].line_lvl == "AREA" && req.body.childs[0].childs);
            console.log(isAreaWithCell);
            if (isAreaWithCell) {
                containerArea = await req.body.childs.map(area => {
                    let areaObj = {
                        line_nm: area.line_nm,
                        line_desc: area.line_desc,
                        line_lvl: area.line_lvl,
                        idx_pos: area.idx_pos
                    }
                    return areaObj
                })
            }
            console.log('containerArea');
            console.log(containerArea);

            await queryPOST(table, objLine)
                .then(async result => {
                    if (!req.body.childs) return response.success(res, 'Success To create Line Only', result)
                    let insertedLineId = result.rows[0].line_id
                    console.log(result.rows[0].line_id);
                    if (isAreaWithoutCell || isCellWithoutArea || isAreaWithCell) {
                        let mapAreawithParentId = containerArea.map(itm => {
                            itm.parent_id = insertedLineId
                            return itm
                        })
                        console.log('mapAreawithParentId');
                        console.log(mapAreawithParentId);
                        await queryBulkPOST(table, mapAreawithParentId)
                            .then(async resultChilds => {
                                if (!req.body.childs[0].childs) return response.success(res, 'Success To create Line With Cell/Area', resultChilds)
                                let mapAreaParentId = await resultChilds.rows.map(child => {
                                    return child.line_id
                                })
                                console.log('mapAreaParentId');
                                console.log(mapAreaParentId);
                                if (isAreaWithCell) {
                                    let mapAreaChilds = await req.body.childs.map((areaItm, i) => {
                                        return areaItm.childs.map(cellItm => {
                                            cellItm.parent_id = mapAreaParentId[i]
                                            return cellItm
                                        })
                                    })
                                    console.log(mapAreaChilds);

                                    for (let i = 0; i < mapAreaChilds.length; i++) {
                                        const rawCell = mapAreaChilds[i];
                                        for (let j = 0; j < rawCell.length; j++) {
                                            containerCell.push(rawCell[j])
                                        }
                                    }
                                    console.log(containerCell);
                                    await queryBulkPOST(table, containerCell)
                                        .then(resCell => {
                                            return response.success(res, 'Success To create Line With Area And Cell', resCell)
                                        })
                                }

                            })
                    }
                })
        } catch (error) {
            console.log(error);
            response.failed(res, error)
        }
    }
}