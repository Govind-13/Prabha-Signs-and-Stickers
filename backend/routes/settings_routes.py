import datetime
from flask import Blueprint, request, jsonify
from db import db, serialize_doc
from middleware.auth import protect

settings_blueprint = Blueprint('settings_blueprint', __name__)

@settings_blueprint.route('/', methods=['GET'])
def get_settings():
    """
    @desc    Get all settings
    @route   GET /api/settings
    @access  Public
    """
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    try:
        settings_cursor = db.settings.find()
        # Convert array of {key, value} to a single dictionary {key: value}
        # to match the mongoose response structure expected by the frontend
        settings_dict = {}
        for s in settings_cursor:
            settings_dict[s['key']] = s['value']
            
        return jsonify(settings_dict)
    except Exception as e:
        print(f"Error getting settings: {e}")
        return jsonify({'message': 'Server Error'}), 500

@settings_blueprint.route('/', methods=['PUT'])
@protect
def update_setting():
    """
    @desc    Update a setting (e.g., animation)
    @route   PUT /api/settings
    @access  Private (Guarded by @protect)
    """
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    data = request.get_json() or {}
    key = data.get('key')
    value = data.get('value')
    
    if not key or value is None:
        return jsonify({'message': 'Please provide both key and value'}), 400
        
    try:
        now = datetime.datetime.utcnow()
        # Find setting and update it, or create if it doesn't exist (upsert)
        result = db.settings.find_one_and_update(
            {'key': key},
            {
                '$set': {
                    'value': value,
                    'updatedAt': now
                },
                '$setOnInsert': {
                    'createdAt': now
                }
            },
            upsert=True,
            return_document=True
        )
        
        return jsonify(serialize_doc(result))
    except Exception as e:
        print(f"Error updating setting: {e}")
        return jsonify({'message': 'Server Error'}), 500
