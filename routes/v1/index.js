var express = require('express');
var router = express.Router();

const { lines } = require('./masterdata/index')
const { register, login } = require('./auth/index')

router.use('/login', login)
router.use('/register', register)

router.use('/master', lines)

module.exports = router;