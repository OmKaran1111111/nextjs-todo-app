import nodemailer from "nodemailer";

interface SendResult {
  success: true;
  mode: "console";
}

function logToConsole(
  email: string,
  subjectLabel: string,
  codeLabel: string,
  code: string,
): void {
  console.log("\n=================== [LOCAL DEV MAIL LOG] ===================");
  console.log(`TO:                ${email}`);
  console.log(`SUBJECT:           ${subjectLabel}`);
  console.log(`${codeLabel.padEnd(19)}${code}`);
  console.log("============================================================\n");
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendVerificationCode(
  email: string,
  code: string,
): Promise<SendResult | nodemailer.SentMessageInfo> {
  if (process.env.NODE_ENV !== "production") {
    logToConsole(email, "Your verification code", "VERIFICATION CODE:", code);
    return { success: true, mode: "console" };
  }

  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}

export async function sendPasswordResetCode(
  email: string,
  code: string,
): Promise<SendResult | nodemailer.SentMessageInfo> {
  if (process.env.NODE_ENV !== "production") {
    logToConsole(email, "Your password reset code", "RESET CODE:", code);
    return { success: true, mode: "console" };
  }

  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your password reset code",
    text: `Your password reset code is ${code}. It expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
  });
}