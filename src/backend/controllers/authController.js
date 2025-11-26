import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserByCpf, findUserById, activateUser } from "../models/userModel.js";
import { createEmailVerificationCode, validateEmailVerificationCode, createLoginTwoFactorCode, validateLoginTwoFactorCode } from "../services/twoFactorService.js";
import { sendVerificationCodeEmail } from "../services/emailService.js";

export const healthAuth = (req, res) => {
  res.json({ status: "auth-route-ok" });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const onlyDigits = (value) => {
  return value.replace(/\D/g, "");
};

export const register = async (req, res) => {
  try {
    const { fullName, birthDate, cpf, phone, email, password } = req.body;

    if (!fullName || !birthDate || !cpf || !phone || !email || !password) {
      return res.status(400).json({ error: "missing_fields" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "invalid_email" });
    }

    const cleanCpf = onlyDigits(cpf);
    const cleanPhone = onlyDigits(phone);

    if (cleanCpf.length !== 11) {
      return res.status(400).json({ error: "invalid_cpf" });
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      return res.status(400).json({ error: "invalid_phone" });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: "email_in_use" });
    }

    const existingCpf = await findUserByCpf(cleanCpf);
    if (existingCpf) {
      return res.status(409).json({ error: "cpf_in_use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      fullName,
      birthDate,
      cpf: cleanCpf,
      phone: cleanPhone,
      email,
      passwordHash,
      status: "pending"
    });

    const code = await createEmailVerificationCode(newUser.id);
    await sendVerificationCodeEmail(email, code);

    return res.status(201).json({
      message: "user_created_pending_verification",
      userId: newUser.id
    });
  } catch (error) {
    console.error("register_error", error);
    return res.status(500).json({ error: "internal_error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: "missing_fields" });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "user_not_found" });
    }

    if (user.status === "active") {
      return res.status(400).json({ error: "already_active" });
    }

    const validation = await validateEmailVerificationCode(userId, code);
    if (!validation.valid) {
      return res.status(400).json({ error: "invalid_code", reason: validation.reason });
    }

    await activateUser(userId);

    return res.status(200).json({ message: "email_verified" });
  } catch (error) {
    console.error("verify_email_error", error);
    return res.status(500).json({ error: "internal_error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "missing_fields" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "user_not_active" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const code = await createLoginTwoFactorCode(user.id);
    await sendVerificationCodeEmail(user.email, code);

    return res.status(200).json({
      message: "login_code_sent",
      userId: user.id
    });
  } catch (error) {
    console.error("login_error", error);
    return res.status(500).json({ error: "internal_error" });
  }
};

export const verifyLoginCode = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: "missing_fields" });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "user_not_found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "user_not_active" });
    }

    const validation = await validateLoginTwoFactorCode(userId, code);
    if (!validation.valid) {
      return res.status(400).json({ error: "invalid_code", reason: validation.reason });
    }

    const secret = process.env.JWT_SECRET || "dev_secret";
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      secret,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "login_success",
      token
    });
  } catch (error) {
    console.error("verify_login_error", error);
    return res.status(500).json({ error: "internal_error" });
  }
};