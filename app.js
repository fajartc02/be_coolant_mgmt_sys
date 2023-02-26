require('dotenv').config()

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const cors = require('cors');

var routerV1 = require('./routes/v1/index');

const { database } = require('./config/database')

database.connect()
console.log('DB Connecttion:');
console.log({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    ssl: false
});

var cron = require('node-cron');
const cronGenerateSchedules = require('./functions/cronGenerateSchedules')

// cronGenerateSchedules()
cron.schedule('0 0 */1 * *', (s) => { // 0 0 */1 * * At 00:00 on every day-of-month.
    // 0 */2 * * * (At minute 0 past every 2nd hour.)
    // FOR TEST */10 * * * * * (every 10 sec)
    console.log(s);
    console.log('running a task every sec');
    cronGenerateSchedules()
});

var app = express();

app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname));

app.use('/api/v1', routerV1);

module.exports = app;