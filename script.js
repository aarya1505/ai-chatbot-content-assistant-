const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const saveChatBtn = document.getElementById('save-chat-btn');
const deleteChatBtn = document.getElementById('delete-chat-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const chatHistoryList = document.getElementById('chat-history-list');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');

const API_BASE_URL = 'http://127.0.0.1:5000';
let chatHistory = [];
let activeChatId = null;

const renderChat = () => {
    chatContainer.innerHTML = '';
    if (chatHistory.length === 0) {
        const welcomeCard = document.createElement('div');
        welcomeCard.className = 'welcome-card';
        welcomeCard.innerHTML = `
            <h2>Welcome to your Instagram Assistant</h2>
            <p>Your AI partner for growing on Instagram</p>
        `;
        chatContainer.appendChild(welcomeCard);

        const firstBotMessage = {
            sender: 'bot',
            text: "Hello! I'm Bella, your Instagram growth assistant. Ask me for Reel ideas, caption hooks, or hashtag strategies to get started!",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        appendMessage(firstBotMessage, false); 
    } else {
        chatHistory.forEach(msg => appendMessage(msg, false));
    }
};

const renderSidebar = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/chats`);
        const chats = await response.json();
        chatHistoryList.innerHTML = '';
        chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'chat-history-item';
            item.textContent = chat.title;
            item.dataset.id = chat.id;
            if (chat.id === activeChatId) {
                item.classList.add('active');
            }
            item.addEventListener('click', () => loadChat(chat.id));
            chatHistoryList.appendChild(item);
        });
    } catch (error) {
        console.error('Failed to load sidebar:', error);
    }
};

const appendMessage = (message, isNew, isError = false) => {
    if (isNew && chatContainer.querySelector('.welcome-card')) {
        chatContainer.innerHTML = '';
    }

    const messageGroup = document.createElement('div');
    messageGroup.classList.add('message-group', message.sender);

    let formattedMessage = message.text;
    formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, "<i>$1</i>");
    formattedMessage = formattedMessage.replace(/\n/g, "<br>");
    formattedMessage = formattedMessage.replace(/^\s*[-*]\s+(.*)$/gm, "• $1");

    let messageHtml = '';
    if (message.sender === 'user') {
        messageHtml = `
            <div class="message-content">
                <div class="message-bubble"><p>${formattedMessage}</p></div>
                <div class="timestamp">${message.time}</div>
            </div>
            <div class="message-avatar user-avatar">
                <img src="https://placehold.co/100x100/F5EBEB/333333?text=A" alt="User Avatar">
            </div>`;
    } else { 
        let actionButtonsHtml = (!isError && isNew) ? `
            <div class="action-buttons">
                <button class="action-btn">Suggest Reel Ideas</button>
                <button class="action-btn">Write a Caption</button>
                <button class="action-btn">Find Hashtags</button>
            </div>` : '';
        messageHtml = `
            <div class="message-avatar bot-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10z"></path><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path></svg>
            </div>
            <div class="message-content">
                <div class="message-bubble"><p>${formattedMessage}</p></div>
                <div class="timestamp">${message.time}</div>
                ${actionButtonsHtml}
            </div>`;
    }
    messageGroup.innerHTML = messageHtml;
    chatContainer.appendChild(messageGroup);
    
    messageGroup.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', () => {
            userInput.value = button.textContent;
            handleSendMessage();
        });
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;
};

const handleSendMessage = async () => {
    const userMessageText = userInput.value.trim();
    if (!userMessageText) return;

    if (chatHistory.length === 0 && chatContainer.querySelector('.welcome-card')) {
         chatHistory.push({
            sender: 'bot',
            text: "Hello! I'm Bella, your Instagram growth assistant. Ask me for Reel ideas, caption hooks, or hashtag strategies to get started!",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    }

    const userMessage = { sender: 'user', text: userMessageText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    chatHistory.push(userMessage);
    appendMessage(userMessage, true);
    userInput.value = '';
    setLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessageText }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const botMessage = { sender: 'bot', text: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        chatHistory.push(botMessage);
        appendMessage(botMessage, true);
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = {
            sender: 'bot', text: "Sorry, I couldn't connect. Please check the backend.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        appendMessage(errorMessage, true, true);
    } finally {
        setLoading(false);
    }
};

const loadChat = async (chatId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chats/${chatId}`);
        if (response.ok) {
            chatHistory = await response.json();
            activeChatId = chatId;
            renderChat();
            renderSidebar(); 
        } else {
            alert('Failed to load chat.');
            handleNewChat();
        }
    } catch (error) {
        console.error('Load chat error:', error);
    }
};

const handleNewChat = () => {
    chatHistory = [];
    activeChatId = null;
    renderChat();
    renderSidebar();
};

const saveChat = async () => {
    if (chatHistory.length <= 1) { 
        alert("Nothing to save. Please start a conversation first.");
        return;
    }
    if(activeChatId){
        alert("This chat is already saved. Changes will create a new save.");
        activeChatId = null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatHistory),
        });
        if (response.ok) {
            const data = await response.json();
            activeChatId = data.id;
            alert('Chat saved successfully!');
            renderSidebar();
        } else {
            alert('Failed to save chat.');
        }
    } catch (error) {
        console.error('Save chat error:', error);
        alert('Error saving chat.');
    }
};

const deleteChat = async () => {
    if (!activeChatId) {
        alert("This is an unsaved chat. There is nothing to delete.");
        return;
    }
    if (!confirm('Are you sure you want to delete this chat? This cannot be undone.')) {
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/chats/${activeChatId}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Chat deleted successfully.');
            handleNewChat();
        } else {
            alert('Failed to delete chat.');
        }
    } catch (error) {
        console.error('Delete chat error:', error);
        alert('Error deleting chat.');
    }
};

const setLoading = (isLoading) => {
    sendBtn.disabled = isLoading;
    userInput.disabled = isLoading;
    
    const existingIndicator = document.getElementById('loading-indicator');
    if (existingIndicator) existingIndicator.remove();

    if (isLoading) {
        sendBtn.innerHTML = '<div class="loading-spinner"></div>';
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.classList.add('message-group', 'bot');
        loadingDiv.innerHTML = `
            <div class="message-avatar bot-avatar">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10z"></path><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path></svg>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-indicator"><div></div><div></div><div></div></div>
                </div>
            </div>`;
        chatContainer.appendChild(loadingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
        sendBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
    }
};

sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSendMessage();
});
saveChatBtn.addEventListener('click', saveChat);
deleteChatBtn.addEventListener('click', deleteChat);
newChatBtn.addEventListener('click', handleNewChat);
menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

window.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    renderChat();
});
