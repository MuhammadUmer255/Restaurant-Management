export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 chars, 1 letter, 1 number, 1 special character
  const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

export const getPasswordErrorMessage = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/(?=.*[A-Za-z])/.test(password)) return 'Password must contain at least one letter.';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number.';
  if (!/(?=.*[@$!%*#?&])/.test(password)) return 'Password must contain at least one special character (@$!%*#?&).';
  return '';
};