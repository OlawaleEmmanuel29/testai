from http.server import BaseHTTPRequestHandler
import json
import os
from livekit import api

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 1. Load Credentials
        api_key = os.environ.get('LIVEKIT_API_KEY')
        api_secret = os.environ.get('LIVEKIT_API_SECRET')
        livekit_url = os.environ.get('LIVEKIT_URL')

        # 2. Generate Token
        token = api.AccessToken(api_key, api_secret) \
            .with_identity("hotel_guest") \
            .with_name("Guest") \
            .with_grants(api.VideoGrants(room_join=True, room="hotel_reception")) \
            .to_jwt()

        # 3. Send Response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        # CORS Headers (Crucial for React)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "token": token,
            "url": livekit_url
        }
        self.wfile.write(json.dumps(response).encode())
