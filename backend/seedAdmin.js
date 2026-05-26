// One-off bootstrap: wipe all admins and create exactly one.
// Reads credentials from env vars OR positional args so nothing
// secret lives in version control.
//
// Usage (from backend/):
//   SEED_USERNAME=youruser SEED_PASSWORD=yourpass node seedAdmin.js
// or:
//   node seedAdmin.js youruser yourpass
//
// Requires MONGO_URI in backend/.env (or in the shell).

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const USERNAME = process.env.SEED_USERNAME || process.argv[2];
const PASSWORD = process.env.SEED_PASSWORD || process.argv[3];

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing. Set it in backend/.env or the shell.');
    process.exit(1);
  }
  if (!USERNAME || !PASSWORD) {
    console.error('Usage: SEED_USERNAME=u SEED_PASSWORD=p node seedAdmin.js');
    console.error('   or: node seedAdmin.js <username> <password>');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const deleted = await Admin.deleteMany({});
    console.log(`Removed ${deleted.deletedCount} existing admin(s).`);

    const admin = await Admin.create({ username: USERNAME, password: PASSWORD });
    console.log(`Created admin "${admin.username}" (_id=${admin._id}).`);
    console.log('Done. You can now log in at /admin-login.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
