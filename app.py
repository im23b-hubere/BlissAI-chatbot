from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash
from flask_cors import CORS
from flask_mysqldb import MySQL
from flask_session import Session
import requests
import jwt
import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key'

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
Session(app)

# MySQL parameter
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'hello1234'
app.config['MYSQL_DB'] = 'blissAI'

mysql = MySQL(app)

# CORS aktivieren
CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'])


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


def generate_token(user_id):
    """
    :param user_id:
    :return: token
    """
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, app.secret_key, algorithm='HS256')


def verify_token(token):
    """
    :param token:
    :return: verification
    """
    try:
        payload = jwt.decode(token, app.secret_key, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


@app.route('/chat', methods=['POST'])
def chat():
    """
    :return: Chat message
    """
    user_message = request.json.get("message")
    token = request.headers.get('Authorization')

    user_id = verify_token(token)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

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

        if "choices" in data and len(data["choices"]) > 0:
            content = data["choices"][0].get("message", {}).get("content", "Keine Antwort")
            formatted_response = content.replace(". ", ".\n")
        else:
            formatted_response = "Keine Antwort"

        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO messages (user_id, message, sender) VALUES (%s, %s, %s)",
                    (user_id, user_message, 'user'))
        cur.execute("INSERT INTO messages (user_id, message, sender) VALUES (%s, %s, %s)",
                    (user_id, formatted_response, 'bot'))
        mysql.connection.commit()
        cur.close()

        return jsonify({"response": formatted_response}), 200
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
    """
    :return: Login
    """
    email = request.form.get('email')
    password = request.form.get('password')

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM User WHERE email = %s AND password = %s", (email, password))
    user = cur.fetchone()
    cur.close()

    if user:
        token = generate_token(user[0])
        return jsonify({"message": "Login erfolgreich!", "token": token}), 200
    else:
        return jsonify({"error": "Ungültige Anmeldeinformationen"}), 400


@app.route('/check_login_status', methods=['GET'])
def check_login_status():
    """
    :return: Login Status
    """
    token = request.headers.get('Authorization')
    if token:
        user_id = verify_token(token)
        if user_id:
            return jsonify({"loggedIn": True}), 200
    return jsonify({"loggedIn": False}), 200


@app.route('/check_session', methods=['GET'])
def check_session():
    """
    :return: user session
    """
    if 'user' in session:
        return jsonify({"user": session['user']}), 200
    else:
        return jsonify({"error": "No active session"}), 400


@app.route('/account', methods=['GET'])
def account():
    """
    :return: account page
    """
    token = request.headers.get('Authorization')
    if token:
        user_id = verify_token(token)
        if user_id:
            cur = mysql.connection.cursor()
            cur.execute("SELECT email FROM User WHERE id = %s", [user_id])
            user = cur.fetchone()
            cur.close()
            if user:
                return jsonify({"email": user[0]}), 200
    return jsonify({"error": "Unauthorized"}), 401


@app.route('/save_chat', methods=['POST'])
def save_chat():
    """
    :return: saved chat
    """
    chat_id = request.json.get('chatId')
    user_id = verify_token(request.headers.get('Authorization'))

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO Chats (user_id, chat_id) VALUES (%s, %s)", (user_id, chat_id))
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Chat saved successfully!"}), 200


@app.route('/get_chats', methods=['GET'])
def get_chats():
    """
    :return:Chat to account (still not working)
    """
    token = request.headers.get('Authorization')
    user_id = verify_token(token)

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT chat_id FROM Chats WHERE user_id = %s", [user_id])
        chats = cur.fetchall()
        cur.close()

        chat_list = [chat[0] for chat in chats]
        return jsonify({"chats": chat_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
