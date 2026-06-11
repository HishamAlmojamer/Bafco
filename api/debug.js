module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({
    method: req.method,
    body: req.body,
    bodyType: typeof req.body,
    contentType: req.headers['content-type'],
    hasBody: !!req.body,
  }));
};
