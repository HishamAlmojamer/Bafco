const fs = require('fs');
const path = require('path');

async function ensureUploadsDir() {
  const dir = path.join(__dirname, '../../../public/uploads');
  fs.mkdirSync(dir, { recursive: true });
}

module.exports = { ensureUploadsDir };

