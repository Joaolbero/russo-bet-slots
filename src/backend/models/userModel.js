import { db } from "../db/connection.js";

export const createUser = (userData) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO users (full_name, birth_date, cpf, phone, email, password_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userData.fullName,
      userData.birthDate,
      userData.cpf,
      userData.phone,
      userData.email,
      userData.passwordHash,
      userData.status
    ];
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
};

export const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

export const findUserByCpf = (cpf) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE cpf = ?`;
    db.get(query, [cpf], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

export const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE id = ?`;
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

export const activateUser = (id) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE users
      SET status = 'active', updated_at = datetime('now')
      WHERE id = ?
    `;
    db.run(query, [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};