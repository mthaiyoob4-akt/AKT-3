const fs = require('fs');

const filePath = 'backend/routes/auth.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add nodemailer import after jwt import
const importSection = `import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';
import { auth } from '../middleware/auth.js';`;

const newImportSection = `import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { db } from '../database/db.js';
import { auth } from '../middleware/auth.js';`;

content = content.replace(importSection, newImportSection);

// Add email transporter and send function after JWT_SECRET
const jwtLine = `const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';`;

const emailSetup = `const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Which Renewables Registration',
      html: \`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your One-Time Password (OTP) for Which Renewables registration is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">\${otp}</h1>
          </div>
          <p style="color: #666;">This OTP will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Which Renewables Team</p>
        </div>
      \`,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};`;

content = content.replace(jwtLine, emailSetup);

// Update the request-otp endpoint to actually send email
const oldOtpEndpoint = `    // In production, send OTP via email service (SendGrid, Nodemailer, etc.)
    console.log(\`OTP for \${email}: \${otp}\`);

    res.json({
      ok: true,
      message: 'OTP sent to email',
      // For development only - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });`;

const newOtpEndpoint = `    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      console.log(\`OTP for \${email}: \${otp}\`); // Fallback logging
    }

    res.json({
      ok: true,
      message: 'OTP sent to email',
      // For development only - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });`;

content = content.replace(oldOtpEndpoint, newOtpEndpoint);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Email functionality added to auth.js');
