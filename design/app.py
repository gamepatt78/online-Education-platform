from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import mysql.connector
import secrets
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Database connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Jacksparow12#",
    port="3306",
    database="student_portal"
)
cursor = db.cursor()

# ------------------- Feedback Submission -------------------
@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    data = request.form
    name = data.get('name')
    email = data.get('email')
    rating = int(data.get('rating'))
    feedback_text = data.get('feedback')

    query = "INSERT INTO feedback (name, email, rating, feedback_text) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (name, email, rating, feedback_text))
    db.commit()

    return jsonify({"message": "Feedback submitted successfully!"}), 200

# ------------------- User Registration -------------------
@app.route('/register', methods=['POST'])
def register():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    dob = data.get('dob')
    designation = data.get('designation')

    if not all([name, email, phone, dob, designation]):
        return jsonify({"message": "All fields are required."}), 400

    try:
        query = "INSERT INTO users (name, email, phone, dob, designation) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(query, (name, email, phone, dob, designation))
        db.commit()
        return jsonify({"message": "Registration successful!"}), 200
    except Exception as e:
        print("Registration error:", e)  # <--- Add this line
        db.rollback()
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

# ------------------- Admission -------------------

@app.route('/submit-admission', methods=['POST'])
def submit_admission():
    data = request.get_json()
    query = """
    INSERT INTO admissions (full_name, dob, gender, previous_degree, cgpa, year_of_passing, email, phone, address)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(query, (
        data['fullName'],
        data['dob'],
        data['gender'],
        data['previousDegree'],
        data['cgpa'],
        data['yearOfPassing'],
        data['email'],
        data['phone'],
        data['address']
    ))
    db.commit()

    return jsonify({"message": "Admission form submitted successfully!"}), 200

# ------------------- Forgot Password -------------------

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() if request.is_json else request.form
    email = data.get('email')

    # Check if the email exists in users table
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        return jsonify({"message": "Email not found."}), 404

    # Generate a secure token
    token = secrets.token_urlsafe(32)

    # Store the token in forgot_password table
    try:
        query = "INSERT INTO forgot_password (email, token, requested_at) VALUES (%s, %s, %s)"
        cursor.execute(query, (email, token, datetime.now()))
        db.commit()
        # In a real app, you would email the token as a reset link to the user
        return jsonify({"message": "Password reset link sent to your email (simulated).", "token": token}), 200
    except Exception as e:
        db.rollback()
        print("Forgot password error:", e)
        return jsonify({"message": "Failed to process forgot password request."}), 500

# ------------------- Start Server -------------------


# Base directory for static files (the `design` folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Directory to store monitor events and images
MONITOR_DIR = os.path.join(BASE_DIR, 'monitor_events')
IMAGES_DIR = os.path.join(MONITOR_DIR, 'images')
os.makedirs(IMAGES_DIR, exist_ok=True)


@app.route('/monitor-event', methods=['POST'])
def monitor_event():
    """Receive monitor events from client. Expects JSON with fields:
    - event: short event type (no-face, multiple-faces, looking-away, monitor-start, ...)
    - details: human-readable details
    - student: optional student identifier/email
    - timestamp: optional ISO timestamp
    - image: optional data URL (data:image/jpeg;base64,...)
    """
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({'message': 'Invalid JSON'}), 400

    event = data.get('event') or 'unknown'
    details = data.get('details') or ''
    student = data.get('student') or data.get('user') or 'unknown'
    timestamp = data.get('timestamp') or datetime.utcnow().isoformat()

    # Save image if provided
    image_name = None
    image_data = data.get('image')
    if image_data and image_data.startswith('data:image'):
        try:
            header, encoded = image_data.split(',', 1)
            import base64
            ext = 'jpg'
            if 'png' in header: ext = 'png'
            image_bytes = base64.b64decode(encoded)
            image_name = f"{event.replace(' ','_')}_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}.{ext}"
            image_path = os.path.join(IMAGES_DIR, image_name)
            with open(image_path, 'wb') as f:
                f.write(image_bytes)
        except Exception as e:
            print('Failed to save image:', e)

    # Append JSONL event
    record = {
        'event': event,
        'details': details,
        'student': student,
        'timestamp': timestamp,
        'image': image_name
    }
    try:
        with open(os.path.join(MONITOR_DIR, 'events.jsonl'), 'a', encoding='utf-8') as fh:
            fh.write(jsonify(record).get_data(as_text=True) + '\n')
    except Exception:
        # fallback to simple write
        try:
            import json as _json
            with open(os.path.join(MONITOR_DIR, 'events_raw.jsonl'), 'a', encoding='utf-8') as fh:
                fh.write(_json.dumps(record) + '\n')
        except Exception as e:
            print('Failed to write event:', e)

    return jsonify({'message': 'event received', 'saved_image': image_name}), 200


@app.route('/', methods=['GET'])
def index():
    # Serve the main index page
    # Serve the dashboard page as the app entrypoint
    return send_from_directory(BASE_DIR, 'dashbord.html')


@app.route('/<path:filename>', methods=['GET'])
def serve_file(filename):
    # Serve files (HTML, CSS, JS, images) from the design folder
    file_path = os.path.join(BASE_DIR, filename)
    if os.path.exists(file_path):
        return send_from_directory(BASE_DIR, filename)
    # If the requested file isn't found, return a 404 JSON for API compatibility
    return abort(404)


if __name__ == '__main__':
    # Bind to 0.0.0.0 for local network testing; keep debug on for development
    app.run(host='0.0.0.0', port=5000, debug=True)
