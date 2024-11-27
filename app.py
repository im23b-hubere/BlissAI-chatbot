from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)

# CORS aktivieren
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    # Abrufen der Benutzer-Nachricht
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Header für die externe API (RapidAPI)
    headers = {
        "Content-Type": "application/json",
        "x-rapidapi-key": "b17da60615mshf52cdcbb404afacp15ce8ejsn9b222cc1f17b",
        "x-rapidapi-host": "meta-llama-3-1-405b1.p.rapidapi.com"
    }

    # Payload für die Anfrage
    payload = {
        "messages": [{"role": "user", "content": user_message}]
    }

    try:
        # Anfrage an die API senden
        response = requests.post("https://meta-llama-3-1-405b1.p.rapidapi.com/chat", headers=headers, json=payload)
        response.raise_for_status()  # Auf Fehler prüfen
        data = response.json()
        print("API Response:", data)  # Zum Debuggen

        # Extrahieren des `content`-Werts
        if "choices" in data and len(data["choices"]) > 0:
            content = data["choices"][0].get("message", {}).get("content", "Keine Antwort")
        else:
            content = "Keine Antwort"

        return jsonify({"response": content}), 200, {'Content-Type': 'application/json'}
    except requests.exceptions.RequestException as e:
        print("Error:", str(e))  # Zum Debuggen
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)