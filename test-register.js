

import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000/api/auth';
const EMAIL = 'john.doe@test.com';
const PASSWORD = 'Password123';

async function testRegistration() {
  try {
    console.log('1. Requesting OTP...');
    const reqOtpRes = await fetch(`${API_URL}/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL })
    });
    const reqOtpData = await reqOtpRes.json();
    console.log('Request OTP response:', reqOtpData);

    if (!reqOtpData.ok) {
      console.error('Failed to request OTP');
      return;
    }

    // Wait a bit for persistence
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Read OTP from persist.json
    console.log('2. Reading OTP from persist.json...');
    const persistPath = path.resolve('backend/database/persist.json');
    if (!fs.existsSync(persistPath)) {
      console.error('persist.json not found');
      return;
    }
    const dbData = JSON.parse(fs.readFileSync(persistPath, 'utf-8'));
    const otpData = dbData.otps[EMAIL.toLowerCase()];
    
    if (!otpData) {
      console.error('OTP not found in DB');
      return;
    }
    
    const otp = otpData.code;
    console.log('Found OTP:', otp);

    console.log('3. Verifying OTP...');
    const verifyRes = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, otp })
    });
    const verifyData = await verifyRes.json();
    console.log('Verify OTP response:', verifyData);

    if (!verifyData.ok) {
      console.error('Failed to verify OTP');
      return;
    }

    console.log('4. Registering user...');
    // Frontend sends username derived from email
    const username = EMAIL.split('@')[0];
    const regRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: EMAIL, 
        password: PASSWORD, 
        otp,
        username 
      })
    });
    const regData = await regRes.json();
    console.log('Register response:', regData);

    if (regData.ok) {
      console.log('SUCCESS: User registered with username:', regData.data.username);
    } else {
      console.error('FAILURE: Registration failed:', regData.error);
    }

  } catch (err) {
    console.error('Test error:', err);
  }
}

testRegistration();
