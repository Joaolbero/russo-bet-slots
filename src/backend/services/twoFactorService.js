import { db } from "../db/connection.js";

const expiresMinutes = Number(process.env.TWO_FACTOR_EXPIRES_MINUTES || "15");

const generateCode = () => {
  const min = 100000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const createTwoFactorCode = (userId, type) => {
  return new Promise((resolve, reject) => {
    const code = generateCode();
    const now = new Date();
    const expires = new Date(now.getTime() + expiresMinutes * 60000);
    const query = `
      INSERT INTO two_factor_codes (user_id, code, type, expires_at)
      VALUES (?, ?, ?, ?)
    `;
    const params = [userId, code, type, expires.toISOString()];
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(code);
      }
    });
  });
};

const validateTwoFactorCode = (userId, code, type) => {
  return new Promise((resolve, reject) => {
    const nowIso = new Date().toISOString();
    const query = `
      SELECT id, code, expires_at
      FROM two_factor_codes
      WHERE user_id = ? AND type = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;
    db.get(query, [userId, type], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve({ valid: false, reason: "not_found" });
      } else if (row.code !== code) {
        resolve({ valid: false, reason: "code_mismatch" });
      } else if (row.expires_at < nowIso) {
        resolve({ valid: false, reason: "expired" });
      } else {
        resolve({ valid: true });
      }
    });
  });
};

export const createEmailVerificationCode = (userId) => {
  return createTwoFactorCode(userId, "verify_email");
};

export const validateEmailVerificationCode = (userId, code) => {
  return validateTwoFactorCode(userId, code, "verify_email");
};

export const createLoginTwoFactorCode = (userId) => {
  return createTwoFactorCode(userId, "login");
};

export const validateLoginTwoFactorCode = (userId, code) => {
  return validateTwoFactorCode(userId, code, "login");
};