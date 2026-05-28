import os
import jwt
from functools import wraps
from flask import request, jsonify

def protect(f):
    """
    Middleware decorator that restricts access to endpoints by verifying a JWT token.
    Expects header format: Authorization: Bearer <token>
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Not authorized, no token'}), 401
            
        try:
            # Decode the token using the secret key
            decoded = jwt.decode(token, os.getenv('JWT_SECRET', 'prabha_secret_key_123'), algorithms=['HS256'])
            # Attach the admin ID to the request object so handlers can access it
            request.admin_id = decoded.get('id')
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Not authorized, token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Not authorized, token failed'}), 401
            
        return f(*args, **kwargs)
    return decorated
