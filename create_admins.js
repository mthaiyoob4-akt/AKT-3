
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const PERSIST_PATH = path.join(__dirname, 'backend', 'database', 'persist.json');
const PASSWORD = 'Which@renewables';

const newAdmins = [
  {
    email: 'syed.shahab.ahmed@vitrux.co.uk',
    username: 'syed.shahab.ahmed'
  },
  {
    email: 'syed.ali.asgar@vitruxshield.com',
    username: 'syed.ali.asgar'
  }
];

const createAdmins = async () => {
  try {
    if (!fs.existsSync(PERSIST_PATH)) {
      console.error('persist.json not found at:', PERSIST_PATH);
      return;
    }

    const raw = fs.readFileSync(PERSIST_PATH, 'utf-8');
    const db = JSON.parse(raw);

    if (!db.users) {
      db.users = [];
    }

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    let addedCount = 0;

    for (const admin of newAdmins) {
      const existingUser = db.users.find(u => u.email.toLowerCase() === admin.email.toLowerCase());
      
      if (existingUser) {
        console.log(`User ${admin.email} already exists. Updating to admin role and resetting password.`);
        existingUser.password = hashedPassword;
        existingUser.role = 'admin';
        existingUser.updatedAt = new Date().toISOString();
      } else {
        const newUser = {
          id: `${Date.now().toString()}-${Math.random().toString(16).slice(2)}`,
          username: admin.username,
          email: admin.email,
          password: hashedPassword,
          role: 'admin',
          profileCompletion: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.users.push(newUser);
        addedCount++;
        console.log(`Created new admin: ${admin.email}`);
      }
    }

    fs.writeFileSync(PERSIST_PATH, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`Successfully processed admin accounts. Added: ${addedCount}`);

  } catch (error) {
    console.error('Error creating admins:', error);
  }
};

createAdmins();
