import requests
import urllib.parse
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client

app = Flask(__name__)
CORS(app) 

# CONFIGURAÇÕES 
SUPABASE_URL = "https://gysiqyxpmlxmlolqzaqs.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5c2lxeXhwbWx4bWxvbHF6YXFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk2MDcwNiwiZXhwIjoyMDkwNTM2NzA2fQ.DRqq9majrxnIT8oUnhrY2qQFB-OG6V4yOfTSGg27lpQ"

def conectar_supabase() -> Client:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return supabase

