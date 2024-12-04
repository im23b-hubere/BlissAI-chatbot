from flask import Flask
from flask_mysqldb import MySQL

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_PORT'] = '3306'
app.config['MYSQL_USER'] = 'eric_huber'
app.config['MYSQL_PASSWORD'] = 'bliss_ai_admin'
app.config['MYSQL_DB'] = 'blissAI'

mysql = MySQL(app)

def create_account(email, password):
    """Funktion zum Erstellen eines neuen Benutzerkontos"""
    cur = mysql.connection.cursor()

    cur.execute("SELECT * FROM User WHERE email = %s", [email])
    existing_user = cur.fetchone()

    if existing_user:
        return False

    cur.execute("INSERT INTO User (email, password) VALUES (%s, %s)", (email, password))
    mysql.connection.commit()

    cur.close()
    return True
