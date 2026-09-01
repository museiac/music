import type { EmailMessage, EmailProvider } from "./email.types.js";
import { SmtpEmailProvider } from "./providers/smtp.provider.js";

const provider: EmailProvider = new SmtpEmailProvider();

export async function sendEmail(message: EmailMessage) {
  await provider.send(message);
}

export async function sendVerificationOtp(
  email: string,
  otp: string
) {
  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Your verification code is ${otp}. This code will expire in 10 minutes.`,
    html: `
      <h2>Musiac Email verification</h2>
      <p>Your musiac verification code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
}