const jwt = require('jsonwebtoken');
const { User } = require('../database/setup');

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user; // includes role
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
