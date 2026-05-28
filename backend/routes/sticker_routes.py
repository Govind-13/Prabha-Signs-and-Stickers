import os
import datetime
import cloudinary
import cloudinary.uploader
from flask import Blueprint, request, jsonify
from bson import ObjectId
from db import db, serialize_doc
from middleware.auth import protect

sticker_blueprint = Blueprint('sticker_blueprint', __name__)

ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

def cloudinary_is_configured():
    return all([
        os.getenv('CLOUDINARY_CLOUD_NAME'),
        os.getenv('CLOUDINARY_API_KEY'),
        os.getenv('CLOUDINARY_API_SECRET')
    ])

def allowed_image(filename):
    return (
        '.' in filename
        and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS
    )

@sticker_blueprint.route('/', methods=['GET'])
def get_stickers():
    """
    @desc    Get all stickers
    @route   GET /api/stickers
    @access  Public
    """
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    try:
        # Sort by createdAt descending (-1)
        stickers_cursor = db.stickers.find().sort('createdAt', -1)
        stickers_list = list(stickers_cursor)
        return jsonify(serialize_doc(stickers_list))
    except Exception as e:
        print(f"Error getting stickers: {e}")
        return jsonify({'message': 'Server Error'}), 500

@sticker_blueprint.route('/', methods=['POST'])
@protect
def create_sticker():
    """
    @desc    Create a sticker
    @route   POST /api/stickers
    @access  Private (Guarded by @protect)
    """
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500

    if not cloudinary_is_configured():
        return jsonify({
            'message': 'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
        }), 500
        
    try:
        title = request.form.get('title', 'Untitled')
        category = request.form.get('category', 'General')
        
        # In Flask, multipart/form-data files are in request.files
        if 'image' not in request.files:
            return jsonify({'message': 'No image provided'}), 400
            
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({'message': 'No image provided'}), 400

        if not allowed_image(image_file.filename):
            return jsonify({'message': 'Only JPG, PNG, and WEBP images are allowed'}), 400
            
        # Upload the file to Cloudinary directly from Flask's file stream
        upload_result = cloudinary.uploader.upload(
            image_file.stream,
            folder='prabha_stickers',
            allowed_formats=['jpg', 'png', 'jpeg', 'webp']
        )

        if not upload_result.get('secure_url') or not upload_result.get('public_id'):
            return jsonify({'message': 'Cloudinary upload failed'}), 502
        
        now = datetime.datetime.utcnow()
        new_sticker = {
            'title': title,
            'imageUrl': upload_result.get('secure_url'),
            'publicId': upload_result.get('public_id'),
            'category': category,
            'createdAt': now,
            'updatedAt': now
        }
        
        result = db.stickers.insert_one(new_sticker)
        new_sticker['_id'] = result.inserted_id
        
        return jsonify(serialize_doc(new_sticker)), 201
    except Exception as e:
        print(f"Error creating sticker: {e}")
        return jsonify({'message': f'Upload failed: {str(e)}'}), 500

@sticker_blueprint.route('/<sticker_id>', methods=['DELETE'])
@protect
def delete_sticker(sticker_id):
    """
    @desc    Delete a sticker
    @route   DELETE /api/stickers/:id
    @access  Private (Guarded by @protect)
    """
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    try:
        # Convert path string ID to BSON ObjectId
        try:
            oid = ObjectId(sticker_id)
        except Exception:
            return jsonify({'message': 'Sticker not found'}), 404
            
        sticker = db.stickers.find_one({'_id': oid})
        
        if sticker:
            # Delete from Cloudinary if publicId exists
            public_id = sticker.get('publicId')
            if public_id:
                try:
                    cloudinary.uploader.destroy(public_id)
                except Exception as ex:
                    print(f"Warning: Cloudinary destroy failed: {ex}")
            
            # Delete from database
            db.stickers.delete_one({'_id': oid})
            return jsonify({'message': 'Sticker removed'})
        else:
            return jsonify({'message': 'Sticker not found'}), 404
    except Exception as e:
        print(f"Error deleting sticker: {e}")
        return jsonify({'message': 'Server Error'}), 500
