require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { StringDecoder } = require('string_decoder');
const db = require('../config/db');
const DATA_DIR = require('../config/dataDirectory');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function readLocalUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
}

function writeLocalUsers(users) {
  const temporaryFile = `${USERS_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(users, null, 2), {
    encoding: 'utf8',
    mode: 0o600
  });
  fs.renameSync(temporaryFile, USERS_FILE);
}

function promptHidden(label) {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    if (!input.isTTY || typeof input.setRawMode !== 'function') {
      reject(new Error('Run this command in an interactive terminal so the password can be entered privately.'));
      return;
    }

    let value = '';
    const decoder = new StringDecoder('utf8');
    const cleanup = () => {
      input.removeListener('data', onData);
      input.setRawMode(false);
      input.pause();
      process.stdout.write('\n');
    };
    const onData = chunk => {
      for (const character of decoder.write(chunk)) {
        if (character === '\u0003') {
          cleanup();
          reject(new Error('Password reset cancelled.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          cleanup();
          resolve(value);
          return;
        }
        if (character === '\u007f' || character === '\b') {
          value = Array.from(value).slice(0, -1).join('');
        } else if (character >= ' ') {
          value += character;
        }
      }
    };

    process.stdout.write(label);
    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
  });
}

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function waitForDatabase() {
  const deadline = Date.now() + 2500;
  while (!db.isPostgresConnected() && Date.now() < deadline) {
    await wait(100);
  }
  return db.isPostgresConnected();
}

async function getTargetAdmin(useDatabase) {
  if (useDatabase) {
    const result = await db.query(
      `SELECT id, email, is_active
       FROM users
       WHERE LOWER(role) = 'admin'`
    );
    if (result.rows.length !== 1) {
      throw new Error('Expected exactly one administrator in the connected database.');
    }
    if (result.rows[0].is_active === false) {
      throw new Error('The administrator account is inactive; reactivate it before signing in.');
    }
    return result.rows[0];
  }

  const users = readLocalUsers();
  const admins = users.filter(user => String(user.role).toLowerCase() === 'admin');
  if (admins.length !== 1) {
    throw new Error('Expected exactly one administrator in the local JSON user store.');
  }
  if (admins[0].is_active === false) {
    throw new Error('The administrator account is inactive; reactivate it before signing in.');
  }
  return admins[0];
}

async function updateLocalMirror(email, passwordHash) {
  const users = readLocalUsers();
  const user = users.find(item =>
    String(item.role).toLowerCase() === 'admin' &&
    String(item.email).toLowerCase() === String(email).toLowerCase()
  );
  if (!user) return;

  user.password_hash = passwordHash;
  writeLocalUsers(users);
}

async function resetPassword() {
  const useDatabase = await waitForDatabase();
  const admin = await getTargetAdmin(useDatabase);
  const password = await promptHidden('New admin password (12-72 bytes): ');
  const confirmation = await promptHidden('Confirm new password: ');

  if (Buffer.byteLength(password, 'utf8') < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Password must be between 12 and 72 bytes.');
  }
  if (password !== confirmation) {
    throw new Error('Passwords do not match.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  if (useDatabase) {
    const result = await db.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2 AND LOWER(role) = 'admin' AND is_active IS DISTINCT FROM FALSE
       RETURNING id`,
      [passwordHash, admin.id]
    );
    if (result.rowCount !== 1) {
      throw new Error('The administrator account changed during reset; no account was updated.');
    }
    await updateLocalMirror(admin.email, passwordHash);
  } else {
    const users = readLocalUsers();
    const user = users.find(item =>
      Number(item.id) === Number(admin.id) &&
      String(item.role).toLowerCase() === 'admin'
    );
    if (!user || user.is_active === false) {
      throw new Error('The administrator account changed during reset; no account was updated.');
    }
    user.password_hash = passwordHash;
    writeLocalUsers(users);
  }

  console.log(`Administrator password reset successfully (${useDatabase ? 'PostgreSQL' : 'local JSON'}).`);
}

async function main() {
  try {
    await resetPassword();
  } catch (error) {
    console.error(error.message || 'Administrator password reset failed.');
    process.exitCode = 1;
  } finally {
    if (db.pool) await db.pool.end();
  }
}

main();
