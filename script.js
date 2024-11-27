const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");

async function sendMessage(event) {
    event.preventDefault();

    const message = userInput.value;
    if (!message) return;

    // Nachricht des Benutzers anzeigen
    appendMessage('You', message);

    try {
        // Anfrage an das Flask-Backend senden
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"  // UTF-8 im Header
            },
            body: JSON.stringify({ message: message }),  // Sicherstellen, dass der Schlüssel 'message' verwendet wird
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.response || "Keine Antwort vom Bot.";
        console.log(botReply);
        // Antwort des Bots anzeigen
        appendMessage('BlissAI', botReply);
    } catch (error) {
        // Fehlerbehandlung
        appendMessage('Error', `Fehler: ${error.message}`);
        console.error("Fehler beim Abrufen der Antwort:", error);  // Bessere Fehlerausgabe
    }

    userInput.value = '';  // Eingabefeld zurücksetzen
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;  // Scrollen zum neuesten Beitrag
}

chatForm.addEventListener('submit', sendMessage);