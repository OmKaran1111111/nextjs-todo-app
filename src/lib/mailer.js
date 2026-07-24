import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationCode(email, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}

export async function sendPasswordResetCode(email, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your password reset code",
    text: `Your password reset code is ${code}. It expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
  });
}