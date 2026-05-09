import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS_KEY, 
  },
});

export async function otpSender(otp: string, email: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
      html: `
        <div style="font-family: Arial; text-align: center;">
          <h2>OTP Verification</h2>
          <p>Your code is:</p>
          <h1 style="color: #4CAF50;">${otp}</h1>
          <p>This code will expire soon.</p>
        </div>
      `,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}