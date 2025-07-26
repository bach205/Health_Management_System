const mysql = require('mysql2');

// Parse DATABASE_URL from Railway
const DATABASE_URL = process.env.DATABASE_URL;
let connection;

if (DATABASE_URL) {
    // Use DATABASE_URL from Railway
    connection = mysql.createConnection(DATABASE_URL);
} else {
    // Fallback to individual environment variables
    const { DB_HOST, DB_USERNAME, DB_NAME, DB_PASSWORD } = process.env;
    connection = mysql.createConnection({
        host: DB_HOST || 'localhost',
        user: DB_USERNAME || 'root',
        password: DB_PASSWORD || '',
        database: DB_NAME || 'hospital'
    });
}

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to DB_NAME: ');
})
