const fs = require('fs');
const path = require('path');
const { Feedback, Admissions, ExamLogs } = require('../services/storageService');

const MONITOR_DIR = path.join(__dirname, '..', '..', 'design', 'monitor_events');
const IMAGES_DIR = path.join(MONITOR_DIR, 'images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function validDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

// Submit Feedback
exports.submitFeedback = async (req, res) => {
  try {
    const body = req.body || {};
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const feedback = typeof body.feedback === 'string' ? body.feedback.trim() : '';
    const rating = Number(body.rating);
    if (!subject || subject.length > 120 || !feedback || feedback.length > 2000 ||
        !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Enter a subject, a message of up to 2,000 characters, and a rating from 1 to 5.'
      });
    }

    await Feedback.create({
      name: req.user.name,
      email: req.user.email,
      rating,
      feedback_text: `${subject}\n${feedback}`
    });

    return res.status(200).json({ success: true, message: 'Feedback submitted successfully!' });
  } catch (error) {
    console.error('Feedback submission failed.');
    return res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
  }
};

// Submit Admission
exports.submitAdmission = async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
      ? req.body
      : {};
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const dob = typeof body.dob === 'string' ? body.dob.trim() : '';
    const gender = typeof body.gender === 'string' ? body.gender.trim().toLowerCase() : '';
    const previousDegree = typeof body.previousDegree === 'string' ? body.previousDegree.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const address = typeof body.address === 'string' ? body.address.trim() : '';

    if (!fullName || fullName.length > 150 ||
        !validDateOnly(dob) || dob > new Date().toISOString().slice(0, 10) ||
        !['male', 'female', 'other'].includes(gender) ||
        !previousDegree || previousDegree.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 ||
        !phone || phone.length > 25 ||
        !address) {
      return res.status(400).json({
        success: false,
        message: 'Provide a valid name, date of birth, gender, previous degree, email, phone, and address.'
      });
    }

    const cgpa = body.cgpa === undefined || body.cgpa === null || body.cgpa === ''
      ? null
      : Number(body.cgpa);
    if (cgpa !== null && (!Number.isFinite(cgpa) || Math.abs(cgpa) > 99.99)) {
      return res.status(400).json({ success: false, message: 'CGPA must fit the supported numeric range.' });
    }

    const rawYear = body.yearOfPassing;
    const yearString = typeof rawYear === 'string' ? rawYear.trim() : rawYear;
    const yearOfPassing = yearString === undefined || yearString === null || yearString === ''
      ? null
      : typeof yearString === 'string' && /^\d{4}(?:-(0[1-9]|1[0-2]))?$/.test(yearString)
        ? Number(yearString.slice(0, 4))
        : Number(yearString);
    if (yearOfPassing !== null &&
        (!Number.isSafeInteger(yearOfPassing) || yearOfPassing < -2147483648 || yearOfPassing > 2147483647)) {
      return res.status(400).json({ success: false, message: 'Year of passing must be a whole number.' });
    }

    await Admissions.create({
      fullName,
      dob,
      gender,
      previousDegree,
      cgpa,
      yearOfPassing,
      email,
      phone,
      address
    });
    return res.status(200).json({ success: true, message: 'Admission form submitted successfully!' });
  } catch (error) {
    console.error('Admission submission failed.');
    return res.status(500).json({ success: false, message: 'Failed to submit admission application.' });
  }
};

// Monitor Event Log
exports.logMonitorEvent = async (req, res) => {
  try {
    const data = req.body || {};
    const event = typeof data.event === 'string' ? data.event.slice(0, 80) : 'activity';
    const details = typeof data.details === 'string' ? data.details.slice(0, 500) : '';
    const student = req.user.email;
    let imageName = null;

    if (typeof data.image === 'string' && data.image.length <= 1500000) {
      try {
        const matches = data.image.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/i);
        if (matches) {
          const ext = matches[1].toLowerCase() === 'png' ? 'png' : 'jpg';
          const buffer = Buffer.from(matches[2], 'base64');
          const validSignature = ext === 'png'
            ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            : buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
          if (validSignature && buffer.length <= 1000000) {
            imageName = `${event.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${ext}`;
            fs.writeFileSync(path.join(IMAGES_DIR, imageName), buffer);
          }
        }
      } catch (imgErr) {
        console.warn('Failed to save webcam snapshot.');
      }
    }

    await ExamLogs.create({
      student,
      event,
      details,
      image: imageName || ''
    });

    return res.status(200).json({ status: 'ok', message: 'Event logged successfully', saved_image: imageName });
  } catch (error) {
    console.error('Exam log submission failed.');
    return res.status(500).json({ status: 'error', message: 'Failed to log exam event.' });
  }
};

// Get Exam Logs
exports.getExamLogs = async (req, res) => {
  try {
    const logs = await ExamLogs.getAll(50);
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Exam log retrieval failed.');
    return res.status(500).json({ success: false, message: 'Unable to retrieve exam logs.' });
  }
};
