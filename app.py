from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash
from flask_cors import CORS
from flask_mysqldb import MySQL
import requests

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# MySQL parameter
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'hello1234'
app.config['MYSQL_DB'] = 'blissAI'

mysql = MySQL(app)

# CORS aktivieren
CORS(app)

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

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    headers = {
        "Content-Type": "application/json",
        "x-rapidapi-key": "b17da60615mshf52cdcbb404afacp15ce8ejsn9b222cc1f17b",
        "x-rapidapi-host": "meta-llama-3-1-405b1.p.rapidapi.com"
    }

    payload = {
        "messages": [{"role": "user", "content": user_message}]
    }

    try:
        response = requests.post("https://meta-llama-3-1-405b1.p.rapidapi.com/chat", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        print("API Response:", data)

        if "choices" in data and len(data["choices"]) > 0:
            content = data["choices"][0].get("message", {}).get("content", "Keine Antwort")
        else:
            content = "Keine Antwort"

        return jsonify({"response": content}), 200, {'Content-Type': 'application/json'}
    except requests.exceptions.RequestException as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/signup', methods=['GET'])
def signup_page():
    return render_template('signup.html')

@app.route('/create_account', methods=['POST'])
def create_account_route():
    """Erstellt ein Benutzerkonto"""
    email = request.form.get('email')
    password = request.form.get('password')
    confirm_password = request.form.get('confirm-password')

    if not email or not password or not confirm_password:
        return jsonify({"error": "Alle Felder sind erforderlich"}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwörter stimmen nicht überein"}), 400

    try:
        if create_account(email, password):
            return jsonify({"message": "Account created successfully!"}), 201
        else:
            return jsonify({"error": "User already exists, try another email."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM User WHERE email = %s AND password = %s", (email, password))
    user = cur.fetchone()
    cur.close()

    if user:
        session['user'] = user[0]
        flash('Login erfolgreich!', 'success')
        return redirect(url_for('chat_page'))
    else:
        flash('Ungültige Anmeldeinformationen', 'error')
        return redirect(url_for('login_page'))

@app.route('/chat_page')
def chat_page():
    if 'user' in session:
        return render_template('index.html')
    else:
        return redirect(url_for('login_page'))

@app.route('/login_page')
def login_page():
    return render_template('auth.html')

if __name__ == '__main__':
    app.run(debug=True)