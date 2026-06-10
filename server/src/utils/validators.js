function requireJsonBody(obj, keys) {
  for (const k of keys) {
    if (obj[k] === undefined || obj[k] === null || String(obj[k]).trim() === '') {
      throw new Error(`Missing ${k}`);
    }
  }
}

module.exports = { requireJsonBody };

