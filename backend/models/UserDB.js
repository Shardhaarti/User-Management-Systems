var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 100,
    host:'localhost',
    user:'root',
    password:'root1',
    database:'users',
    port: 3306,
    debug: false,
    multipleStatements: true
});

module.exports = pool;