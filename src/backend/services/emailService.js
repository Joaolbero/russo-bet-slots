import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass
  }
});

export const sendVerificationCodeEmail = async (to, code) => {
  const subject = "Seu código de verificação - Russo Bet Slots";
  const text = `Seu código de verificação é: ${code}`;
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 16px;">
      <h1 style="font-size: 20px; margin-bottom: 12px;">Russo Bet Slots</h1>
      <p style="margin-bottom: 8px;">Seu código de verificação é:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">${code}</p>
      <p style="font-size: 12px; color: #6b7280;">Este código é válido por alguns minutos. Se você não solicitou este código, ignore este e-mail.</p>
    </div>
  `;
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
};