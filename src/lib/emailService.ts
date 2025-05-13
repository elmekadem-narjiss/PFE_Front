import nodemailer from 'nodemailer';
import { VOLTAGE_THRESHOLD, TEMPERATURE_THRESHOLD } from './batteryMonitoring';

// Configure the email transporter (using a test account for now)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email', // Use Ethereal for testing (replace with real SMTP in production)
  port: 587,
  auth: {
    user: 'violet.erdman@ethereal.email', // Replace with your Ethereal email
    pass: 'YKBkfEFdHHvypRPsEw', // Replace with your Ethereal password
  },
});

// Function to send an email notification
export async function sendBatteryFailureEmail(battery: { id: string; voltage: number; temperature: number }) {
  const mailOptions = {
    from: 'violet.erdman@ethereal.email', // Sender address
    to: 'narjiss.elmekadem@etu.uae.ac.ma', // Replace with the admin's email
    subject: `Battery Failure Alert: ${battery.id}`,
    text: `Battery ${battery.id} has failed!\n\nVoltage: ${battery.voltage}V (Threshold: <${VOLTAGE_THRESHOLD}V)\nTemperature: ${battery.temperature}°C (Threshold: >${TEMPERATURE_THRESHOLD}°C)\n\nPlease take action immediately.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}