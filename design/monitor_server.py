from flask import Flask, request, jsonify
from flask_cors import CORS
from contextlib import contextmanager
import hmac
import os
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5000",
                "http://127.0.0.1:5000",
            ]
        }
    },
)

@contextmanager
def get_db():
    conn = sqlite3.connect('exam_logs.db')
    conn.row_factory = sqlite3.Row
    try:
        with conn:
            yield conn
    finally:
        conn.close()

def authorize_monitor_request():
    token = os.environ.get('MONITOR_SERVER_TOKEN', '')
    if len(token.encode('utf-8')) < 32:
        return jsonify({'error': 'Configure MONITOR_SERVER_TOKEN with at least 32 characters.'}), 503

    authorization = request.headers.get('Authorization', '')
    supplied_token = authorization[7:] if authorization.startswith('Bearer ') else ''
    if not supplied_token or not hmac.compare_digest(supplied_token, token):
        return jsonify({'error': 'A valid bearer token is required.'}), 401
    return None

# Create table if not exists
with get_db() as db:
    db.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student TEXT,
            event TEXT,
            details TEXT,
            image TEXT,
            timestamp TEXT
        )
    ''')

@app.route('/api/log', methods=['POST'])
def log_event():
    authorization_error = authorize_monitor_request()
    if authorization_error:
        return authorization_error

    data = request.json
    with get_db() as db:
        db.execute(
            'INSERT INTO logs (student, event, details, image, timestamp) VALUES (?, ?, ?, ?, ?)',
            (
                data.get('student', 'Unknown'),
                data.get('event', ''),
                data.get('details', ''),
                data.get('image', ''),
                datetime.now().isoformat()
            )
        )
    return jsonify({'status': 'ok'})

@app.route('/api/logs', methods=['GET'])
def get_logs():
    authorization_error = authorize_monitor_request()
    if authorization_error:
        return authorization_error

    with get_db() as db:
        logs = db.execute('SELECT * FROM logs ORDER BY id DESC LIMIT 50').fetchall()
        return jsonify([dict(row) for row in logs])

if __name__ == '__main__':
    app.run(
        host='127.0.0.1',
        port=int(os.environ.get('MONITOR_SERVER_PORT', '5001')),
        debug=False,
    )