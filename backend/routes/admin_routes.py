import os
import datetime
import jwt
import bcrypt
from flask import Blueprint, request, jsonify
from db import db, serialize_doc

admin_blueprint = Blueprint('admin_blueprint', __name__)

def generate_token(admin_id):
    """Generates a JWT token valid for 30 days."""
    payload = {
        'id': str(admin_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }
    return jwt.encode(payload, os.getenv('JWT_SECRET', 'prabha_secret_key_123'), algorithm='HS256')

def hash_password(password):
    """Hashes a password string using bcrypt."""
    salt = bcrypt.gensalt(10)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(entered_password, hashed_password):
    """Compares an entered password against a hashed bcrypt password."""
    try:
        return bcrypt.checkpw(entered_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

@admin_blueprint.route('/login', methods=['POST'])
def login():
    """
    @desc    Auth admin & get token
    @route   POST /api/admin/login
    @access  Public
    """
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Please provide both username and password'}), 400
        
    try:
        admin = db.admins.find_one({'username': username})
        
        if admin and check_password(password, admin.get('password', '')):
            token = generate_token(admin['_id'])
            return jsonify({
                '_id': str(admin['_id']),
                'username': admin['username'],
                'token': token
            })
        else:
            return jsonify({'message': 'Invalid username or password'}), 401
    except Exception as e:
        print(f"Error on admin login: {e}")
        return jsonify({'message': 'Server Error'}), 500

@admin_blueprint.route('/register', methods=['POST'])
def register():
    """
    @desc    Register first admin (Helper route)
    @route   POST /api/admin/register
    @access  Public
    """
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Please provide both username and password'}), 400
        
    try:
        admin_exists = db.admins.find_one({'username': username})
        if admin_exists:
            return jsonify({'message': 'Admin already exists'}), 400
            
        hashed_password = hash_password(password)
        now = datetime.datetime.utcnow()
        
        new_admin = {
            'username': username,
            'password': hashed_password,
            'createdAt': now,
            'updatedAt': now
        }
        
        result = db.admins.insert_one(new_admin)
        token = generate_token(result.inserted_id)
        
        return jsonify({
            '_id': str(result.inserted_id),
            'username': username,
            'token': token
        }), 201
    except Exception as e:
        print(f"Error on admin register: {e}")
        return jsonify({'message': 'Server Error'}), 500
