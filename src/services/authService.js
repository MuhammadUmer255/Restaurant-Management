import api from '../config/api';

const FAILURE_KEYWORDS = ['failed', 'invalid', 'not match', 'expired', 'not found', 'too many'];

const isFailureMessage = (message = '') =>
  FAILURE_KEYWORDS.some((kw) => message.toLowerCase().includes(kw));

export const registerUser = async ({
  fullName,
  restaurantName,
  email,
  role,
  designation,
  password,
  confirmPassword,
}) => {
  const { data } = await api.post('/auth/register', {
    full_name: fullName,
    restaurant_name: restaurantName || null,
    email,
    role,
    designation: designation || null,
    password,
    confirm_password: confirmPassword,
  });

  if (isFailureMessage(data.message) || data.error) {
    throw new Error(data.error || data.message);
  }
  return data.user;
};

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });

  if (isFailureMessage(data.message) || data.error) {
    throw new Error(data.error || data.message);
  }
  return {
    user: data.user,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', {
    email: email?.trim()?.toLowerCase(),
  });
  if (isFailureMessage(data.message) || data.error) {
    throw new Error(data.error || data.message);
  }
  return data.message;
};

export const verifyOtp = async (email, otp) => {
  const { data } = await api.post('/auth/verify-otp', {
    email: email?.trim()?.toLowerCase(),
    otp: otp?.trim(),
  });
  if (isFailureMessage(data.message) || data.error) {
    throw new Error(data.error || data.message);
  }
  return data.message;
};

export const resetPassword = async ({ email, otp, newPassword, confirmPassword }) => {
  const { data } = await api.post('/auth/reset-password', {
    email: email?.trim()?.toLowerCase(),
    otp: otp?.trim(),
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  if (isFailureMessage(data.message) || data.error) {
    throw new Error(data.error || data.message);
  }
  return data.message;
};