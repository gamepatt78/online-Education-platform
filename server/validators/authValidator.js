exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required fields.'
    });
  }
  next();
};

exports.validateRegister = (req, res, next) => {
  const { name, email, phone, dob, password, confirmPassword } = req.body || {};
  if (![name, email, phone, dob, password].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, phone number, date of birth, and password are required.'
    });
  }

  if (name.trim().length > 60 || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid name and email address.'
    });
  }

  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters and no more than 72 bytes.'
    });
  }

  if (confirmPassword !== undefined && confirmPassword !== password) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match.'
    });
  }

  if (typeof phone !== 'string' || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Phone number must be a 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
    });
  }

  if (typeof dob !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid date of birth.'
    });
  }

  const dateOfBirth = new Date(`${dob}T00:00:00.000Z`);
  if (Number.isNaN(dateOfBirth.getTime()) || dateOfBirth.toISOString().slice(0, 10) !== dob) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid date of birth.'
    });
  }

  const indiaDateParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const indiaToday = [
    indiaDateParts.find(part => part.type === 'year').value,
    indiaDateParts.find(part => part.type === 'month').value,
    indiaDateParts.find(part => part.type === 'day').value
  ].join('-');

  if (dob > indiaToday) {
    return res.status(400).json({
      success: false,
      message: 'Date of birth cannot be in the future.'
    });
  }

  next();
};
