const {
    getData,
    postData
} = require('./linesControllers')

module.exports = {
    lines: {
        getData,
        postData
    },
    machines: {
        getData
    }
}