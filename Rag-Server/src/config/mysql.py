import mysql.connector
import os

# Helper function to get MySQL connection
# Update with your actual MySQL credentials
MYSQL_CONFIG = {
    'user': os.getenv("DATABASE_USERNAME"),
    'password': os.getenv("DATABASE_PASSWORD"),
    'host': os.getenv("DATABASE_HOST"),
    'database': os.getenv("DATABASE_NAME"),
}

def get_mysql_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)