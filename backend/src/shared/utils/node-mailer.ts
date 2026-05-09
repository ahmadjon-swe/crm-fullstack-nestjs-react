import * as nodemailer from 'nodemailer';

async function  getTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

export async function otpSender(otp: string, email: string): Promise<void> {
  const transporter = await getTransporter(); // har safar chaqirilganda yaratiladi

  await transporter.sendMail({
    from: `"Education CRM" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'CRM — OTP tasdiqlash kodi',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:400px;margin:40px auto;
                  border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#3730d9;padding:24px;text-align:center;">
          <h2 style="color:#fff;margin:0;">🎓 Education CRM</h2>
        </div>
        <div style="padding:32px;text-align:center;">
          <p style="color:#6b7280;margin:0 0 16px;">Tizimga kirish uchun OTP kodingiz:</p>
          <div style="background:#f0f3ff;border-radius:10px;padding:20px;
                      font-size:2rem;font-weight:800;color:#3730d9;letter-spacing:0.4em;">
            ${otp}
          </div>
          <p style="color:#9ca3af;font-size:13px;margin:16px 0 0;">
            expires in 2 minutes.
          </p>
        </div>
      </div>
    `,
  });
}