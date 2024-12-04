from flask import Flask, request, jsonify, render_template, redirect, url_for
import requests
from flask_cors import CORS
from db import create_account


app = Flask(__name__)

# CORS aktivieren
CORS(app)

# Chat Route
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
        # Anfrage an die API senden
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
    email = request.form['email']
    password = request.form['password']
    confirm_password = request.form['confirm-password']

    if password != confirm_password:
        return jsonify({"error": "Passwörter stimmen nicht überein"}), 400

    if create_account(email, password):
        return jsonify({"message": "Account created successfully!"}), 201
    else:
        return jsonify({"error": "User already exists, try another email."}), 400

if __name__ == '__main__':
    app.run(debug=True)
