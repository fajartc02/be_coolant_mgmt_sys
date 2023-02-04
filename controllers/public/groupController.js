const table = 'tb_m_group'
const { queryGET } = require('../../helpers/query')
const response = require('../../helpers/response')

module.exports = {
    getPublicGroup: (req, res) => {
        queryGET(table, null, ['id', 'group_nm', 'is_deleted'])
            .then((result) => {
                console.log(result);
                response.success(res, 'Success to get PUBLIC GROUP', result)
            }).catch((err) => {
                console.log(err);
            });
    }
}