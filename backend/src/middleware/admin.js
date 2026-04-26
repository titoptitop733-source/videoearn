const admin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  next();
};

module.exports = { admin };