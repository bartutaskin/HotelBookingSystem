from hugchat import hugchat
from hugchat.login import Login
import os
from pathlib import Path
import json

HF_EMAIL = os.getenv("HF_EMAIL")
HF_PASSWORD = os.getenv("HF_PASSWORD")


def generate_response(prompt_input, email, passwd):
    # Hugging Face Login
    sign = Login(email, passwd)
    cookies = sign.login()
    # Create ChatBot
    chatbot = hugchat.ChatBot(cookies=cookies.get_dict())
    return chatbot.chat(prompt_input)


prompt = "What is Streamlit?"
response = generate_response(prompt, HF_EMAIL, HF_PASSWORD)
