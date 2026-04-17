const fs = require('fs');
const filePath = 'backend/routes/auth.js';
let content = fs.readFileSync(filePath, 'utf8');

// Check if nodemailer import exists
if (!content.includes('import nodemailer')) {
  // Add it after jwt import
  content = content.replace(
    "import jwt from 'jsonwebtoken';",
    "import jwt from 'jsonwebtoken';\nimport nodemailer from 'nodemailer';"
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Nodemailer import added');
} else {
  console.log('✓ Nodemailer import already exists');
}
