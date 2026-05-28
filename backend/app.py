import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
app.url_map.strict_slashes = False

# Configure CORS
# This allows the React frontend (running on port 3000 or custom dev port) to fetch API resources
CORS(app)

# Import Blueprints
from routes.admin_routes import admin_blueprint
from routes.settings_routes import settings_blueprint
from routes.sticker_routes import sticker_blueprint

# Register Blueprints
app.register_blueprint(admin_blueprint, url_prefix='/api/admin')
app.register_blueprint(settings_blueprint, url_prefix='/api/settings')
app.register_blueprint(sticker_blueprint, url_prefix='/api/stickers')

@app.route('/')
def home():
    """Root endpoint for status check."""
    return 'Prabha Signs & Stickers API is running...'

# Error handler for 404
@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Resource not found'}), 404

# Error handler for 500
@app.errorhandler(500)
def server_error(error):
    return jsonify({'message': 'Server Error'}), 500

if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 5000))
    # Run the Flask app
    print(f"Starting Python/Flask server on port {PORT}...")
    app.run(host='0.0.0.0', port=PORT, debug=True)
