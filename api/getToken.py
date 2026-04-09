import os
import json
from livekit import api

def handler(request):
    # 1. Grab credentials from Vercel Environment Variables
    api_key = os.environ.get('LIVEKIT_API_KEY')
    api_secret = os.environ.get('LIVEKIT_API_SECRET')
    livekit_url = os.environ.get('LIVEKIT_URL')

    # 2. Safety check
    if not api_key or not api_secret:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Missing LiveKit Credentials in Vercel'})
        }

    # 3. Generate the Access Token
    # We use "Hotel Guest" as a default identity
    token = api.AccessToken(api_key, api_secret) \
        .with_identity("hotel_guest_user") \
        .with_name("Hotel Guest") \
        .with_grants(api.VideoGrants(
            room_join=True,
            room="hotel_reception" 
        )).to_jwt()

    # 4. Return the response
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        'body': json.dumps({
            "token": token,
            "url": livekit_url
        })
    }
