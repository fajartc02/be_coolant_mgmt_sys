var express = require('express');
var router = express.Router();

// ROUTE PUBLIC
const public = require('./public')

const { register, login } = require('./auth/index')
const masterdata = require('./masterdata/index')

router.use('/public', public)

router.use('/login', login)
router.use('/register', register)

router.use('/master', masterdata)

module.exports = router;