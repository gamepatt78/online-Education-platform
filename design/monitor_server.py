from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect('exam_logs.db')
    conn.row_factory = sqlite3.Row
    return conn

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
    with get_db() as db:
        logs = db.execute('SELECT * FROM logs ORDER BY id DESC LIMIT 50').fetchall()
        return jsonify([dict(row) for row in logs])

if __name__ == '__main__':
    app.run(port=5000, debug=True)