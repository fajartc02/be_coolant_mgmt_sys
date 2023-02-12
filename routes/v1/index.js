var express = require('express');
var router = express.Router();

// ROUTE PUBLIC
const public = require('./public')

const { register, login } = require('./auth/index')
const masterdata = require('./masterdata/index')
const operational = require('./operational/index')

router.use('/public', public)

router.use('/login', login)
router.use('/register', register)

router.use('/master', masterdata)

router.use('/operational', operational)

module.exports = router;