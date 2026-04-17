// MongoDB Database Inspection Script
// Run with: node inspect_db.js
// Shows all collections, document counts, and sample data

import mongoose from 'mongoose';
import User from './models/User.js';
import Company from './models/Company.js';
import Content from './models/Content.js';
import OTP from './models/OTP.js';
import FinanceContact from './models/FinanceContact.js';
import PasswordReset from './models/PasswordReset.js';
import AuditLog from './models/AuditLog.js';
import NewsletterSubscriber from './models/NewsletterSubscriber.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/which-renewables';

// Format output helper
const formatJSON = (obj) => JSON.stringify(obj, null, 2);
const truncate = (str, len = 50) => str && str.length > len ? str.substring(0, len) + '...' : str;

const inspectDatabase = async () => {
  try {
    console.log('🔍 Inspecting MongoDB Database...\n');
    console.log('================================\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ Connected to: ${MONGODB_URI}\n`);

    // Get database stats
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📦 Collections found: ${collections.length}\n`);

    // 1. USERS
    console.log('👤 USERS Collection');
    console.log('-------------------');
    const userCount = await User.countDocuments();
    console.log(`Total users: ${userCount}`);
    if (userCount > 0) {
      const users = await User.find().select('-password').lean();
      users.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.email} (${u.username}) - Role: ${u.role || 'user'}`);
        console.log(`     Created: ${u.createdAt}, Profile Complete: ${u.profileCompletion}%`);
      });
    }
    console.log('');

    // 2. COMPANIES
    console.log('🏢 COMPANIES Collection');
    console.log('-----------------------');
    const companyCount = await Company.countDocuments();
    console.log(`Total companies: ${companyCount}`);
    if (companyCount > 0) {
      const companies = await Company.find().lean();
      companies.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.companyName}`);
        console.log(`     Slug: ${c.slug}`);
        console.log(`     UserId: ${c.userId}`);
        console.log(`     Main Sector: ${c.mainSector || 'N/A'}`);
        
        // Count tabs data
        const tabs = c.tabs || {};
        const awardsCount = tabs.awards?.items?.length || 0;
        const caseStudiesCount = tabs.caseStudies?.items?.length || 0;
        const productsCount = tabs.productsServices?.items?.length || 0;
        const projectsCount = tabs.projects?.items?.length || 0;
        
        if (awardsCount || caseStudiesCount || productsCount || projectsCount) {
          console.log(`     Data: ${awardsCount} awards, ${caseStudiesCount} case studies, ${productsCount} products, ${projectsCount} projects`);
        }
        console.log(`     Created: ${c.createdAt || c.timestamps?.createdAt}`);
      });
    }
    console.log('');

    // 3. CONTENT
    console.log('📄 CONTENT Collection');
    console.log('---------------------');
    const contentCount = await Content.countDocuments();
    console.log(`Total content sections: ${contentCount}`);
    if (contentCount > 0) {
      const contents = await Content.find().lean();
      contents.forEach((c, i) => {
        const dataLength = Array.isArray(c.data) ? c.data.length : 0;
        console.log(`  ${i + 1}. Section: "${c.section}" - ${dataLength} items`);
        if (dataLength > 0 && c.data[0]) {
          const sample = c.data[0];
          console.log(`     Sample: ${sample.title || sample.name || sample.id || 'N/A'}`);
        }
      });
    }
    console.log('');

    // 4. FINANCE CONTACTS
    console.log('💰 FINANCE CONTACTS Collection');
    console.log('------------------------------');
    const financeCount = await FinanceContact.countDocuments();
    console.log(`Total contacts: ${financeCount}`);
    if (financeCount > 0) {
      const contacts = await FinanceContact.find().lean();
      contacts.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.name} (${c.email}) - ${c.companyName}`);
        console.log(`     Funding: ${c.fundingAmount}, Status: ${c.status}`);
        console.log(`     Created: ${c.createdAt}`);
      });
    }
    console.log('');

    // 5. NEWSLETTER SUBSCRIBERS
    console.log('📧 NEWSLETTER SUBSCRIBERS Collection');
    console.log('------------------------------------');
    const subCount = await NewsletterSubscriber.countDocuments();
    console.log(`Total subscribers: ${subCount}`);
    if (subCount > 0) {
      const subs = await NewsletterSubscriber.find().lean();
      subs.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.email} - Active: ${s.active}, Subscribed: ${s.subscribedAt}`);
      });
    }
    console.log('');

    // 6. OTP
    console.log('🔑 OTP Collection');
    console.log('-----------------');
    const otpCount = await OTP.countDocuments();
    console.log(`Total OTP records: ${otpCount}`);
    if (otpCount > 0) {
      const otps = await OTP.find().lean();
      otps.forEach((o, i) => {
        const expired = new Date() > new Date(o.expiresAt);
        console.log(`  ${i + 1}. ${o.email} - Code: ${o.code} - Verified: ${o.verified} - ${expired ? 'EXPIRED' : 'Active'}`);
      });
    }
    console.log('');

    // 7. PASSWORD RESETS
    console.log('🔒 PASSWORD RESETS Collection');
    console.log('-----------------------------');
    const resetCount = await PasswordReset.countDocuments();
    console.log(`Total reset records: ${resetCount}`);
    console.log('');

    // 8. AUDIT LOGS
    console.log('📝 AUDIT LOGS Collection');
    console.log('------------------------');
    const auditCount = await AuditLog.countDocuments();
    console.log(`Total audit logs: ${auditCount}`);
    if (auditCount > 0) {
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(5).lean();
      logs.forEach((l, i) => {
        console.log(`  ${i + 1}. [${l.action}] by User: ${l.userId} at ${l.createdAt}`);
        if (l.metadata) {
          console.log(`     Metadata: ${formatJSON(l.metadata).substring(0, 100)}`);
        }
      });
    }
    console.log('');

    // SUMMARY
    console.log('================================');
    console.log('📊 DATABASE SUMMARY');
    console.log('================================');
    console.log(`Users:              ${userCount}`);
    console.log(`Companies:          ${companyCount}`);
    console.log(`Content Sections:   ${contentCount}`);
    console.log(`Finance Contacts:   ${financeCount}`);
    console.log(`Newsletter Subs:    ${subCount}`);
    console.log(`OTP Records:        ${otpCount}`);
    console.log(`Password Resets:    ${resetCount}`);
    console.log(`Audit Logs:         ${auditCount}`);
    console.log('================================');

  } catch (error) {
    console.error('❌ Error inspecting database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

// Run if called directly
inspectDatabase();
