const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");
const accountButton = document.getElementById("account-button");

async function updateAccountButtonStatus() {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const response = await fetch('http://localhost:5000/check_login_status', {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            });
            const data = await response.json();

            if (data.loggedIn) {
                accountButton.textContent = 'Account';
                accountButton.onclick = () => {
                    window.location.href = 'account.html';
                };
            } else {
                accountButton.textContent = 'Login';
                accountButton.onclick = () => {
                    window.location.href = 'auth.html';
                };
            }
        } catch (error) {
            console.error('Fehler beim Abrufen des Login-Status:', error);
            accountButton.textContent = 'Login';
            accountButton.onclick = () => {
                window.location.href = 'auth.html';
            };
        }
    } else {
        accountButton.textContent = 'Login';
        accountButton.onclick = () => {
            window.location.href = 'auth.html';
        };
    }
}

document.addEventListener("DOMContentLoaded", updateAccountButtonStatus);

async function sendMessage(event) {
    event.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    console.log("Sende Nachricht:", message);

    appendMessage('You', message);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch("http://localhost:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': token || ''
            },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.response || "Keine Antwort vom Bot.";
        console.log("Bot-Antwort:", botReply);
        appendMessage('BlissAI', botReply);
    } catch (error) {
        appendMessage('Error', `Fehler: ${error.message}`);
        console.error("Fehler beim Abrufen der Antwort:", error);
    }

    userInput.value = '';
    console.log("Eingabefeld nach Senden:", userInput.value);
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function loginUser(token) {
    localStorage.setItem('token', token);
    updateAccountButtonStatus();
    window.location.href = 'index.html';
}

function logoutUser() {
    localStorage.removeItem('token');
    updateAccountButtonStatus();
    window.location.href = 'index.html';
}

chatForm.addEventListener('submit', sendMessage);