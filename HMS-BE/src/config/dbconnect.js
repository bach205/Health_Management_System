const { DB_HOST, DB_USERNAME, DB_NAME, DB_PASSWORD } = process.env

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "123456",
    database: "test"
})

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to DB_NAME: ' + "test");
})