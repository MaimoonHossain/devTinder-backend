const validator = require('validator');

const validateSignUpData = (data) => {
  const { firstName, lastName, emailId, password } = data;

  if (!firstName || !lastName) {
    throw new Error('First name and last name are required');
  } else if (!validator.isEmail(emailId)) {
    throw new Error('Invalid email format');
  } else if (!validator.isStrongPassword(password)) {
    throw new Error(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    );
  }
};

const validateProfileEditData = (data) => {
  const allowedEditFields = [
    'firstName',
    'lastName',
    'emailId',
    'photoUrl',
    'skills',
    'about',
  ];

  const isEditAllowed = Object.keys(data).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateProfileEditData,
};
