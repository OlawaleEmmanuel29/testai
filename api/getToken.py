from http.server import BaseHTTPRequestHandler
import json
import os
from livekit import api

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 1. Grab credentials from Vercel Environment Variables
        api_key = os.environ.get('LIVEKIT_API_KEY')
        api_secret = os.environ.get('LIVEKIT_API_SECRET')
        livekit_url = os.environ.get('LIVEKIT_URL')

        # 2. Safety Check: If keys are missing, return a clear error
        if not all([api_key, api_secret, livekit_url]):
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_data = {
                "error": "Environment variables not configured in Vercel",
                "missing": {
                    "API_KEY": not bool(api_key),
                    "API_SECRET": not bool(api_secret),
                    "URL": not bool(livekit_url)
                }
            }
            self.wfile.write(json.dumps(error_data).encode())
            return

        try:
            # 3. Generate the Access Token
            # Using os.urandom to give every visitor a unique ID
            unique_id = os.urandom(4).hex()
            
            token = api.AccessToken(api_key, api_secret) \
                .with_identity(f"hotel_guest_{unique_id}") \
                .with_name("Hotel Guest") \
                .with_grants(api.VideoGrants(room_join=True, room="hotel_receptionist")) \
                .to_jwt()

            # 4. Success Response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*') # Essential for React
            self.end_headers()
            
            response_data = {
                "token": token,
                "url": livekit_url
            }
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            # Catch any unexpected errors from the LiveKit SDK
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
