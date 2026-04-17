const fs = require('fs');

const filePath = 'src/components/navcontent/AuthModal.js';
const content = fs.readFileSync(filePath, 'utf8');

// Find the line with authMode and insert state variables after it
const lines = content.split('\n');
const newLines = [];
let inserted = false;

for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  
  if (lines[i].includes("const [authMode, setAuthMode]") && !inserted) {
    newLines.push("  const [showPassword, setShowPassword] = useState(false);");
    newLines.push("  const [showConfirmPassword, setShowConfirmPassword] = useState(false);");
    newLines.push("  const [showNotification, setShowNotification] = useState(false);");
    newLines.push("  const [otpSent, setOtpSent] = useState(false);");
    newLines.push("  const [otpVerified, setOtpVerified] = useState(false);");
    newLines.push("  const [loading, setLoading] = useState(false);");
    newLines.push("  const [error, setError] = useState('');");
    inserted = true;
  }
}

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('✓ State variables added to AuthModal.js');
