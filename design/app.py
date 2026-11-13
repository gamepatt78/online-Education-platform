from flask import Flask, Response, request, jsonify, send_from_directory, abort, redirect
from flask_cors import CORS
import mysql.connector
import secrets
from datetime import datetime
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request as URLRequest, urlopen

app = Flask(__name__)
CORS(app)
PUBLIC_ASSET_EXTENSIONS = {
    '.html', '.css', '.js',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.ico',
    '.woff', '.woff2', '.ttf', '.eot',
    '.pdf', '.mp4', '.webm', '.mp3', '.ogg',
}

# Database connection configured via environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "student_portal")

try:
    db = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT,
        database=DB_NAME
    )
    cursor = db.cursor()
except Exception as db_err:
    print("MySQL connection warning:", db_err)
    db = None
    cursor = None

# ------------------- Feedback Submission -------------------
@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    api_base = os.getenv('FEEDBACK_API_URL', 'http://127.0.0.1:5000').rstrip('/')
    return proxy_node_request(
        f'{api_base}/submit-feedback',
        'Feedback service is unavailable. Start the Node app with npm.cmd start and try again.'
    )

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

@app.route('/monitor-event', methods=['POST'])
def monitor_event():
    api_base = os.getenv('MONITOR_API_URL', 'http://127.0.0.1:5000').rstrip('/')
    return proxy_node_request(
        f'{api_base}/monitor-event',
        'Exam monitoring service is unavailable. Start the Node app with npm.cmd start and try again.'
    )


def proxy_node_request(url, unavailable_message):
    headers = {}
    if request.content_type:
        headers['Content-Type'] = request.content_type
    if request.headers.get('Authorization'):
        headers['Authorization'] = request.headers['Authorization']
    data = request.get_data() if request.method not in {'GET', 'HEAD'} else None
    upstream_request = URLRequest(
        url,
        data=data,
        headers=headers,
        method=request.method,
    )

    try:
        with urlopen(upstream_request, timeout=5) as upstream_response:
            return Response(
                upstream_response.read(),
                status=upstream_response.status,
                content_type=upstream_response.headers.get('Content-Type', 'application/json'),
            )
    except HTTPError as upstream_error:
        return Response(
            upstream_error.read(),
            status=upstream_error.code,
            content_type=upstream_error.headers.get('Content-Type', 'application/json'),
        )
    except (URLError, TimeoutError) as upstream_error:
        app.logger.warning('Node API request failed: %s', upstream_error)
        return jsonify({
            'success': False,
            'message': unavailable_message,
        }), 503


@app.route('/api/auth/<endpoint>', methods=['POST'])
def proxy_auth_request(endpoint):
    if endpoint not in {'register', 'login', 'forgot-password'}:
        abort(404)

    api_base = os.getenv('AUTH_API_URL', 'http://127.0.0.1:5000/api/auth').rstrip('/')
    return proxy_node_request(
        f'{api_base}/{endpoint}',
        'Authentication server is unavailable. Start the Node app with npm.cmd start and try again.'
    )


@app.route('/api/students/profile', methods=['GET', 'PUT'])
def proxy_student_profile():
    api_base = os.getenv('STUDENT_API_URL', 'http://127.0.0.1:5000/api/students').rstrip('/')
    return proxy_node_request(
        f'{api_base}/profile',
        'Student profile service is unavailable. Start the Node app with npm.cmd start and try again.'
    )


@app.route('/api/students/dashboard', methods=['GET'])
def proxy_student_dashboard():
    api_base = os.getenv('STUDENT_API_URL', 'http://127.0.0.1:5000/api/students').rstrip('/')
    return proxy_node_request(
        f'{api_base}/dashboard',
        'Student dashboard service is unavailable. Start the Node app with npm.cmd start and try again.'
    )


@app.route('/api/students/courses', methods=['GET'])
def proxy_student_courses():
    api_base = os.getenv('STUDENT_API_URL', 'http://127.0.0.1:5000/api/students').rstrip('/')
    return proxy_node_request(
        f'{api_base}/courses',
        'Student courses service is unavailable. Start the Node app with npm.cmd start and try again.'
    )


@app.route('/api/students/enroll', methods=['POST'])
def proxy_student_enrollment():
    api_base = os.getenv('STUDENT_API_URL', 'http://127.0.0.1:5000/api/students').rstrip('/')
    return proxy_node_request(
        f'{api_base}/enroll',
        'Course enrollment service is unavailable. Start the Node app with npm.cmd start and try again.'
    )


@app.route('/api/students/certificate/<int:course_id>', methods=['GET'])
def proxy_student_certificate(course_id):
    api_base = os.getenv('STUDENT_API_URL', 'http://127.0.0.1:5000/api/students').rstrip('/')
    return proxy_node_request(
        f'{api_base}/certificate/{course_id}',
        'Certificate service is unavailable. Start the Node app with npm.cmd start and try again.'
    )


@app.route('/api/students/certificates', methods=['GET', 'POST'])
def proxy_student_certificates():
    api_base = os.getenv('STUDENT_API_URL', 'http://127.0.0.1:5000/api/students').rstrip('/')
    return proxy_node_request(
        f'{api_base}/certificates',
        'Certificate service is unavailable. Start the Node app with npm.cmd start and try again.'
    )


@app.route('/api/feedback', methods=['POST'])
def proxy_feedback_request():
    api_base = os.getenv('FEEDBACK_API_URL', 'http://127.0.0.1:5000/api').rstrip('/')
    return proxy_node_request(
        f'{api_base}/feedback',
        'Feedback service is unavailable. Start the Node app with npm.cmd start and try again.'
    )


@app.route('/', methods=['GET'])
def index():
    # Serve the main index page
    # Serve the dashboard page as the app entrypoint
    return send_from_directory(BASE_DIR, 'dashbord.html')


@app.route('/Teacher', defaults={'path': ''}, methods=['GET', 'HEAD'])
@app.route('/Teacher/<path:path>', methods=['GET', 'HEAD'])
def legacy_teacher_path(path):
    target = '/teacher' + request.path[len('/Teacher'):]
    if request.query_string:
        target += '?' + request.query_string.decode('latin-1')
    return redirect(target, code=301)


@app.route('/images', defaults={'path': ''}, methods=['GET', 'HEAD'])
@app.route('/images/<path:path>', methods=['GET', 'HEAD'])
def legacy_image_path(path):
    target = '/assets/images' + ('/' + path if path else '')
    if request.query_string:
        target += '?' + request.query_string.decode('latin-1')
    return redirect(target, code=301)


@app.route('/<path:filename>', methods=['GET'])
def serve_file(filename):
    extension = os.path.splitext(filename)[1].lower()
    if extension not in PUBLIC_ASSET_EXTENSIONS:
        abort(404)

    file_path = os.path.join(BASE_DIR, filename)
    if os.path.exists(file_path):
        return send_from_directory(BASE_DIR, filename)
    return abort(404)


if __name__ == '__main__':
    app.run(
        host='127.0.0.1',
        port=int(os.getenv('APP_PORT', '5002')),
        debug=False,
    )
