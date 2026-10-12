"use server";

import nodemailer from "nodemailer";

/**
 * Sends a notification email when a new contact message is received.
 */
export async function sendNotificationEmail(data: {
  name: string;
  email: string;
  message: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Message from ${data.name}`,
    text: `
You have received a new message from your portfolio contact form.

Name: ${data.name}
Email: ${data.email}
Time: ${new Date().toLocaleString()}

Message:
${data.message}
    `,
    html: `
    <h2>You have a new message!</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
