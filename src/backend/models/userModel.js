import { db } from "../db/connection.js";

export const createUser = (userData, callback) => {
  const query = `
    INSERT INTO users (email, password_hash, status, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `;
  const params = [userData.email, userData.passwordHash, userData.status];
  db.run(query, params, function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, { id: this.lastID });
  });
};