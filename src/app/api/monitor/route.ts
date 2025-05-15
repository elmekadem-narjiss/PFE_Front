import { NextResponse } from 'next/server';
import si from 'systeminformation';
import { Pool } from 'pg';
import sgMail from '@sendgrid/mail';

// Hardcoded SendGrid API key
const SENDGRID_API_KEY = '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';

// Initialize PostgreSQL Pool with hardcoded credentials
const pool = new Pool({
  user: 'admin',
  password: 'admin123',
  host: 'localhost',
  port: 5432,
  database: 'energy_db',
});

// Handle unexpected pool errors
pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

// Set SendGrid API key with validation
if (!SENDGRID_API_KEY || !SENDGRID_API_KEY.startsWith('SG.')) {
  console.error('Invalid SendGrid API key. Email alerts will not be sent.');
} else {
  console.log('SendGrid API key set successfully');
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const THRESHOLDS = {
  cpuUsage: 80, // %
  ramUsage: 80, // %
  storageUsed: 900, // GB (sur 1000 GB max)
  temperature: 70, // °C
};

const ADMIN_EMAIL = 'narjiss.elmekadem@etu.uae.ac.ma'; // Replace with a real, verified email

// Function to ensure the errors table exists
async function ensureErrorsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS errors (
        id SERIAL PRIMARY KEY,
        equipment_id VARCHAR(255) NOT NULL,
        metric VARCHAR(255) NOT NULL,
        value FLOAT NOT NULL,
        timestamp TIMESTAMP NOT NULL
      )
    `);
    console.log('Errors table verified or created');
  } catch (err) {
    console.error('Failed to create errors table:', err);
    throw new Error(`Failed to create errors table: ${(err as Error).message}`);
  }
}

export async function GET() {
  try {
    // Ensure the errors table exists before inserting
    await ensureErrorsTable();

    console.log('Fetching metrics...');
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const fs = await si.fsSize();
    const temp = await si.cpuTemperature();

    const metrics = {
      cpuUsage: cpu.currentLoad,
      ramUsage: (mem.used / mem.total) * 100,
      storageUsed: (fs[0]?.used || 0) / (1024 * 1024 * 1024), // Convert bytes to GB
      temperature: temp.main || 0,
    };
    console.log('Metrics collected:', metrics);

    const alerts: string[] = [];
    if (metrics.cpuUsage > THRESHOLDS.cpuUsage) {
      alerts.push(`High CPU Usage: ${metrics.cpuUsage.toFixed(2)}%`);
    }
    if (metrics.ramUsage > THRESHOLDS.ramUsage) {
      alerts.push(`High RAM Usage: ${metrics.ramUsage.toFixed(2)}%`);
    }
    if (metrics.storageUsed > THRESHOLDS.storageUsed) {
      alerts.push(`High Storage Usage: ${metrics.storageUsed.toFixed(2)} GB`);
    }
    if (metrics.temperature > THRESHOLDS.temperature) {
      alerts.push(`High Temperature: ${metrics.temperature.toFixed(2)}°C`);
    }
    console.log('Alerts:', alerts);

    if (alerts.length > 0) {
      const equipmentId = 'local-server';
      console.log('Logging alerts to PostgreSQL...');
      for (const alert of alerts) {
        const [metric, value] = alert.split(': ')[1].split(' '); // Split to include unit
        await pool.query(
          'INSERT INTO errors(equipment_id, metric, value, timestamp) VALUES($1, $2, $3, $4)',
          [equipmentId, metric.toLowerCase(), parseFloat(value), new Date()]
        );
      }

      if (SENDGRID_API_KEY && SENDGRID_API_KEY.startsWith('SG.')) {
        console.log('Sending email via SendGrid...');
        const emailText = `Alerts at ${new Date().toLocaleString()}:\n${alerts.join('\n')}`;
        try {
          await sgMail.send({
            to: ADMIN_EMAIL,
            from: 'narjiss.elmekadem@etu.uae.ac.ma', // Must be verified in SendGrid
            subject: 'Critical Alert from Monitoring Dashboard',
            text: emailText,
          });
          console.log('Email sent successfully');
        } catch (emailError: any) {
          console.error('Failed to send email via SendGrid:', emailError.message);
          if (emailError.response) {
            console.error('SendGrid response:', JSON.stringify(emailError.response.body, null, 2));
          }
          // Continue execution instead of throwing
        }
      } else {
        console.warn('Skipping email sending due to invalid SendGrid API key');
      }
    }

    return NextResponse.json({ metrics, alerts });
  } catch (error) {
    console.error('Error in monitoring:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}