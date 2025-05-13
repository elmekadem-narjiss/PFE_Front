import nodemailer from 'nodemailer';
import { TEMPERATURE_THRESHOLD } from './batteryMonitoring';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'violet.erdman@ethereal.email',
    pass: 'YKBkfEFdHHvypRPsEw',
  },
});

export async function sendBatteryFailureEmail(battery: { id: string; voltage: number; temperature: number }) {
  const mailOptions = {
    from: 'violet.erdman@ethereal.email',
    to: 'narjiss.elmekadem@etu.uae.ac.ma',
    subject: `Battery Failure Alert: ${battery.id}`,
    text: `Battery ${battery.id} has failed!\n\nVoltage: ${battery.voltage}V\nTemperature: ${battery.temperature}°C (Threshold: >${TEMPERATURE_THRESHOLD}°C)\n\nPlease take action immediately.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, message: 'Email sent successfully', response: info.response };
  } catch (error: any) {
    console.error('Error sending email:', error.message || error);
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
  }
}