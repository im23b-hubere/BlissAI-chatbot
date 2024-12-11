const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const chatForm = document.getElementById("chat-form");

// Login-Button-Element
const accountButton = document.getElementById("account-button");

document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";

    if (isLoggedIn) {
        accountButton.textContent = "Account";
        accountButton.onclick = () => {
            window.location.href = "account.html";
        };
    } else {
        accountButton.textContent = "Login";
        accountButton.onclick = () => {
            window.location.href = "auth.html";
        };
    }
});

async function sendMessage(event) {
    event.preventDefault();

    const message = userInput.value;
    if (!message) return;

    appendMessage('You', message);

    try {
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
        appendMessage('BlissAI', botReply);
    } catch (error) {

        appendMessage('Error', `Fehler: ${error.message}`);
        console.error("Fehler beim Abrufen der Antwort:", error);
    }

    userInput.value = '';
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function loginUser() {
    localStorage.setItem("loggedIn", "true");
    window.location.reload();
}

function logoutUser() {
    localStorage.removeItem("loggedIn");
    window.location.reload();
}


chatForm.addEventListener('submit', sendMessage);

async function checkLoginStatus() {
    try {
        const response = await fetch('http://127.0.0.1:5000/check_login_status');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const accountButton = document.getElementById('account-button');

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
    }
}

document.addEventListener('DOMContentLoaded', checkLoginStatus);
