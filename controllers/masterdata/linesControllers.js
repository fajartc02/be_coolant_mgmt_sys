const table = 'tb_m_lines'
const { queryGET } = require('../../helpers/query')

module.exports = {
    getData: async(req, res) => {
        try {
            let linesData = await queryGET(table)
            console.log(linesData);
        } catch (error) {
            console.log(error);
        }
    }
}