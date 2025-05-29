const { DB_HOST, DB_USERNAME, DB_NAME, DB_PASSWORD } = process.env

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME
})

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to DB_NAME: ' + DB_NAME);
})