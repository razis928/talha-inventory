import nodemailer from 'nodemailer';

import {
  SMTP_EMAIL,
  SMTP_FROM_NAME,
  SMTP_PASSWORD,
  SMTP_TO_EMAIL,
} from '@/config/env-config';

export const sendEmail = async (options: {
  subject: string;
  message: string;
  to?: string;
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD,
      },
    });
    const message = {
      from: `${SMTP_FROM_NAME} <${SMTP_EMAIL}>`,
      to: options.to ?? SMTP_TO_EMAIL,
      subject: options.subject,
      text: options.message,
      // html: option,
    };
    await transporter.sendMail(message);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
