const fs = require('fs');

const filePath = 'backend/routes/auth.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add nodemailer import
const oldImports = `import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';
import { auth } from '../middleware/auth.js';`;

const newImports = `import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { db } from '../database/db.js';
import { auth } from '../middleware/auth.js';`;

content = content.replace(oldImports, newImports);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Nodemailer import added');
