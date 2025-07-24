const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: 'Missing token',
    });
  }
  const jwtToken = token.split(' ')[1];
  jwt.verify(jwtToken, process.env.JWT_SECRET, function (error, jwtDecoded) {
    if (error) {
      return res.status(401).json({
        status: 401,
        message: error.message || 'Invalid token',
      });
    }
    req.userToken = jwtDecoded;
    next();
  });
}

module.exports = verifyToken;
