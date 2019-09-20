const mysql = require('mysql');
// When X DevAPI return objecys instead of array maybe it is worth to use it
/*
const mysqlx = require('@mysql/xdevapi');

// right now settings for production or development are the same, 
// but this could change
const options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    schema: process.env.DB_DB
  };

const pool = mysqlx.getClient( options, 
    { pooling: { 
        enabled: true, 
        maxSize: 50 
    } });
*/

// right now settings are the same, but this could change
if (process.env.NODE_ENV === 'production') {
    pool = mysql.createPool({
        connectionLimit: 50,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DB,
        charset: 'utf8mb4',
    });
} else {
    pool = mysql.createPool({
        connectionLimit: 50,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DB,
        charset: 'utf8mb4',
    });
}

exports.pool = pool;