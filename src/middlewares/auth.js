const adminAuth = (req, res, next) => {
  const token = 'sdfsdf';
  const isAdminAuthorized = token === 'sfdsfsd';

  if (isAdminAuthorized) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

const userAuth = (req, res, next) => {
  const token = 'sdfsdfds';
  const isUserAuthorized = token === 'sdfsdf';

  if (isUserAuthorized) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

module.exports = {
  adminAuth,
  userAuth,
};
