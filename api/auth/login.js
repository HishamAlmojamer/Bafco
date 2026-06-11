module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.statusCode = 200;
    res.end(JSON.stringify({
      method: req.method,
      hasBody: !!req.body,
      bodyType: typeof req.body,
      keys: req.body ? Object.keys(req.body) : [],
      env: {
        databaseUrl: process.env.DATABASE_URL ? 'set (' + process.env.DATABASE_URL.length + ' chars)' : 'MISSING',
        nodeEnv: process.env.NODE_ENV,
      },
    }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
};
