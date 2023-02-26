const { database } = require('../config/database')

function setUpdateTable() {

}

function setInsertTable() {

}

module.exports = {
    queryGET: async(table, whereCond = false, cols = null) => {
        return new Promise(async(resolve, reject) => {
            let selectedCols = '*'
            if (cols) {
                selectedCols = cols.join(',')
            }

            if (!whereCond) {
                whereCond = ''
            }

            let q = `SELECT ${selectedCols} FROM ${table} ${whereCond}`
            console.log(q);
            await database.query(q)
                .then((result) => {
                    resolve(result.rows)
                }).catch((err) => {
                    reject(err)
                });
        })
    },
    queryPOST: async(table, data) => {
        console.log(data);
        return new Promise(async(resolve, reject) => {
            let containerColumn = []
            let containerValues = []
            for (const key in data) {
                containerColumn.push(key)
                containerValues.push(`'${data[key]}'`)
            }
            let q = `INSERT INTO ${table}(${containerColumn.join(',')}) VALUES (${containerValues.join(',')}) RETURNING *`
            console.log(q);
            await database.query(q)
                .then((result) => {
                    resolve(result)
                }).catch((err) => {
                    console.log(err);
                    reject(err)
                });
        })
    },
    queryBulkPOST: async(table, data) => {
        console.log(data);
        return new Promise(async(resolve, reject) => {
            let containerColumn = []
            let containerValues = []
            let mapBulkData = data.map(item => {
                containerValues = []
                console.log(item);
                for (const key in item) {
                    if (key != 'childs') containerValues.push(`'${item[key]}'`)
                }
                console.log(containerValues);
                return `(${containerValues.join(',')})`
            })
            for (const key in data[0]) {
                containerColumn.push(key)
            }
            let q = `INSERT INTO ${table}(${containerColumn.join(',')}) VALUES ${mapBulkData.join(',')} RETURNING *`
            console.log(q);
            await database.query(q)
                .then((result) => {
                    resolve(result)
                }).catch((err) => {
                    console.log(err);
                    reject(err)
                });
        })
    },
    queryPUT: async(table, data, whereCond = '') => {
        return new Promise(async(resolve, reject) => {
            let containerSetValues = []
            for (const key in data) {
                containerSetValues.push(`${key} = '${data[key]}'`)
            }

            let q = `UPDATE ${table} SET ${containerSetValues.join(',')} ${whereCond}`
            await database.query(q)
                .then((result) => {
                    resolve(result)
                }).catch((err) => {
                    reject(err)
                });
        })
    },
    queryDELETE: async(table, whereCond = '') => {
        return new Promise(async(resolve, reject) => {
            let q = `DELETE FROM ${table} ${whereCond}`
            await database.query(q)
                .then((result) => {
                    resolve(result)
                }).catch((err) => {
                    reject(err)
                });
        })
    },
    queryCustom: async(sql) => {
        return new Promise(async(resolve, reject) => {
            let q = sql
            await database.query(q)
                .then((result) => {
                    resolve(result)
                }).catch((err) => {
                    reject(err)
                });
        })
    },
}