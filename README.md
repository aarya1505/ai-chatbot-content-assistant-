# Python-Powered Instagram Chatbot with Sidebar

A sophisticated, multi-conversation chatbot application designed to assist Instagram content creators.  
It features a modern web interface with a sidebar for managing chat history and a powerful Python backend that handles AI responses and data persistence.

---

## 📸 Screenshot
<img width="1919" height="1010" alt="image" src="https://github.com/user-attachments/assets/a345ef03-54f5-49f3-be10-d6b3cb13d111" />


---

## ✨ Features
- **Multi-Chat Interface**: Manage multiple conversations simultaneously, each saved independently.  
- **Persistent Chat History**: Conversations are stored and can be reloaded anytime, with each chat saved as a separate file.  
- **Sidebar Navigation**: Quickly switch between saved chats or start a new one using the intuitive sidebar.  
- **AI-Powered Assistant**: Leverages **Google's Gemini API** to provide expert-level advice for Instagram growth.  
- **Secure API Key Handling**: API key is safely stored in a `.env` file, keeping it out of your source code.  
- **Clean, Responsive UI**: Modern and user-friendly interface built with HTML, CSS, and JavaScript.  

---

## 🛠️ Tech Stack
- **Backend**: Python, Flask, Google Generative AI (`google-generativeai`)  
- **Frontend**: HTML5, CSS3, Vanilla JavaScript  
- **Environment**: `python-dotenv` for managing environment variables  

---

## ⚙️ How it Works

The application is split into two main components:

### 🔹 Frontend (`index.html`)
- Runs directly in the browser.  
- Fetches all saved chats from the backend on startup and displays them in the sidebar.  
- Allows you to start, save, load, or delete conversations.  
- Sends messages to the backend and displays AI-generated responses.  

### 🔹 Backend (`chatbot_1.py`)
- Python server built with **Flask**.  
- Creates a `chats/` directory where each conversation is stored in its own `.json` file.  
- Provides REST API endpoints:  
  - `POST /chat` → Send user message & get AI response  
  - `GET /get_chats` → List all saved chats  
  - `POST /save_chat` → Save or update a chat  
  - `GET /load_chat/<chat_id>` → Load a specific chat  
  - `DELETE /delete_chat/<chat_id>` → Delete a specific chat  

---

## 🚀 Getting Started

### ✅ Prerequisites
- Python **3.7+**  
- `pip` (Python package installer)  
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)  

---

### 🔧 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aarya1505/ai-chatbot-content-assistant-.git
   cd ai-chatbot-content-assistant-
