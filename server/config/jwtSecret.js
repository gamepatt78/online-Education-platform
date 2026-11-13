const secret = (process.env.JWT_SECRET || '').trim();

if (Buffer.byteLength(secret, 'utf8') < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}

module.exports = secret;
