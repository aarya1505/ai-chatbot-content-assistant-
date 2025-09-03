from flask import Flask, request, jsonify, send_from_directory
import os
import json
import google.generativeai as genai
from flask_cors import CORS
from dotenv import load_dotenv
import time

load_dotenv()
app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Please add it in .env file.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

CHAT_DIR = "saved_chats"
if not os.path.exists(CHAT_DIR):
    os.makedirs(CHAT_DIR)

@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_message = request.json.get("message")
        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        prompt = (
            "You are Bella, an expert Instagram growth assistant. "
            "Your tone is helpful, encouraging, and full of actionable advice. "
            f"A user has asked for help with the following: '{user_message}'. "
            "Provide a concise, well-formatted response with clear steps or ideas."
        )
        response = model.generate_content(prompt)
        bot_reply = response.text

        return jsonify({"reply": bot_reply})
    except Exception as e:
        print(f"Error in /chat: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/chats", methods=["GET"])
def get_all_chats():
    try:
        chats = []
        for filename in sorted(os.listdir(CHAT_DIR), reverse=True):
            if filename.endswith(".json"):
                try:
                    with open(os.path.join(CHAT_DIR, filename), 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        first_user_message = next((msg['text'] for msg in data if msg['sender'] == 'user'), 'New Chat')
                        chats.append({
                            "id": filename.replace(".json", ""),
                            "title": first_user_message[:50]
                        })
                except (json.JSONDecodeError, IndexError):
                    continue
        return jsonify(chats)
    except Exception as e:
        print(f"Error in /chats GET: {e}")
        return jsonify({"error": "Could not retrieve chats"}), 500

@app.route("/chats/<chat_id>", methods=["GET"])
def get_chat(chat_id):
    filepath = os.path.join(CHAT_DIR, f"{chat_id}.json")
    if not os.path.exists(filepath):
        return jsonify({"error": "Chat not found"}), 404
    with open(filepath, 'r', encoding='utf-8') as f:
        history = json.load(f)
    return jsonify(history)

@app.route("/chats", methods=["POST"])
def save_chat():
    try:
        chat_history = request.json
        if not chat_history:
            return jsonify({"error": "Empty chat history"}), 400

        chat_id = str(int(time.time() * 1000))
        filepath = os.path.join(CHAT_DIR, f"{chat_id}.json")

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(chat_history, f, indent=2, ensure_ascii=False)

        return jsonify({"message": "Chat saved successfully", "id": chat_id}), 201
    except Exception as e:
        print(f"Error in /chats POST: {e}")
        return jsonify({"error": "Failed to save chat"}), 500

@app.route("/chats/<chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    try:
        filepath = os.path.join(CHAT_DIR, f"{chat_id}.json")
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({"message": "Chat deleted successfully"})
        return jsonify({"error": "Chat not found"}), 404
    except Exception as e:
        print(f"Error in /chats DELETE: {e}")
        return jsonify({"error": "Failed to delete chat"}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
