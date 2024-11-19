document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/chats')
        .then(response => response.json())
        .then(data => {
            const chatList = document.getElementById('chat-list');
            data.chats.forEach(chat => {
                const chatItem = document.createElement('li');
                chatItem.className = 'chat-item';
                chatItem.textContent = chat.name;
                chatList.appendChild(chatItem);
            });
        });
});