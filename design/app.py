from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import secrets
from datetime import datetime

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


if __name__ == '__main__':
    app.run(debug=True)
