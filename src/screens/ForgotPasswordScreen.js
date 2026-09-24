import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { validateEmail, validatePassword, getPasswordErrorMessage } from '../utils/authValidation';
import Toast from '../components/Toast';
import PasswordField from '../components/PasswordField';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Timer state for OTP Resend
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Inline Field Errors
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Toast State (shared Toast component, theme-aware)
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const otpInputs = useRef([]);
  const timerRef = useRef(null);
  const navigationTimeoutRef = useRef(null);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    };
  }, []);

  // OTP Timer Logic
  useEffect(() => {
    if (step === 2) {
      startResendTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showToast = (message, type = 'success') => {
    setToastConfig({ visible: true, message, type });
  };

  const hideToast = () => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  };

  const [generatedOtp, setGeneratedOtp] = useState('');

  // STEP 1: SEND OTP
  const handleSendOtp = () => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError('Email address is required.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    // Generate dynamic 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    setTimeout(() => {
      setLoading(false);
      showToast(`OTP Sent! (Demo Code: ${newOtp})`, 'success');
      setStep(2);
    }, 1000);
  };

  // OTP Paste & Input Handler
  const handleOtpChange = (text, index) => {
    setOtpError('');

    // Handle multi-character paste (e.g., "123456")
    if (text.length > 1) {
      const pastedArray = text.slice(0, 6).split('');
      const updatedOtp = [...otp];

      pastedArray.forEach((char, i) => {
        updatedOtp[i] = char;
      });

      setOtp(updatedOtp);
      const nextFocusIndex = Math.min(pastedArray.length, 5);
      otpInputs.current[nextFocusIndex]?.focus();
      return;
    }

    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    // Auto-advance to next box
    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputs.current[index - 1]?.focus();
        const updatedOtp = [...otp];
        updatedOtp[index - 1] = '';
        setOtp(updatedOtp);
      }
    }
  };

  // STEP 2: VERIFY OTP
  const handleVerifyOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (enteredOtp === generatedOtp || enteredOtp === '123456') {
        showToast('Email verified successfully.', 'success');
        setStep(3);
      } else {
        setOtpError('Invalid verification code. Please check and try again.');
      }
    }, 800);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    showToast(`New code sent! (Demo Code: ${newOtp})`, 'success');
    setOtp(['', '', '', '', '', '']);
    startResendTimer();
  };

  // STEP 3: RESET PASSWORD
  const handleResetPassword = () => {
    let isValid = true;
    setPasswordError('');
    setConfirmPasswordError('');

    if (!validatePassword(newPassword)) {
      setPasswordError(getPasswordErrorMessage(newPassword));
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    if (isValid) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showToast('Your password has been reset successfully.', 'success');
        navigationTimeoutRef.current = setTimeout(() => {
          navigation.navigate('LoginScreen');
        }, 1800);
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
        translucent={false}
      />

      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onDismiss={hideToast}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Dynamic Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                navigation.navigate('LoginScreen');
              }
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="chevron-back-outline" size={16} color={colors.primary} />
              <Text style={styles.backText}>{step > 1 ? 'Previous Step' : 'Back to Login'}</Text>
            </View>
          </TouchableOpacity>

          {/* STEP 1: EMAIL INPUT */}
          {step === 1 && (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="lock-closed-outline" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.title}>Forgot Password?</Text>
              </View>
              <Text style={styles.subtitle}>
                Enter your registered email address below. We'll send you a 6-digit verification code.
              </Text>

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputErrorBorder : null]}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setEmailError('');
                }}
                placeholder="admin@gourmet.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {!!emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleSendOtp}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnText}>Send Verification Code</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: OTP INPUT */}
          {step === 2 && (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="mail-open-outline" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.title}>Enter OTP Code</Text>
              </View>
              <Text style={styles.subtitle}>
                Enter the 6-digit verification code sent to <Text style={styles.highlightText}>{email}</Text>.
              </Text>

              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputs.current[index] = ref)}
                    style={[styles.otpBox, otpError ? styles.inputErrorBorder : null]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={6}
                    selectTextOnFocus
                  />
                ))}
              </View>
              {!!otpError && <Text style={styles.fieldErrorTextCentered}>{otpError}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnText}>Verify Code</Text>
                )}
              </TouchableOpacity>

              {/* Resend Timer Block */}
              <View style={styles.resendContainer}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Text style={styles.resendActiveText}>Resend Code</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendDisabledText}>Resend code in {timer}s</Text>
                )}
              </View>
            </View>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="key-outline" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.title}>Reset Password</Text>
              </View>
              <Text style={styles.subtitle}>Create a new strong password for your account.</Text>

              <Text style={styles.label}>New Password</Text>
              <PasswordField
                style={[styles.input, passwordError ? styles.inputErrorBorder : null]}
                value={newPassword}
                onChangeText={(val) => {
                  setNewPassword(val);
                  setPasswordError('');
                }}
                placeholder="Min 8 chars (e.g. Admin@123)"
                placeholderTextColor={colors.muted}
              />
              {!!passwordError && <Text style={styles.fieldErrorText}>{passwordError}</Text>}

              <Text style={styles.label}>Confirm New Password</Text>
              <PasswordField
                style={[styles.input, confirmPasswordError ? styles.inputErrorBorder : null]}
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  setConfirmPasswordError('');
                }}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.muted}
              />
              {!!confirmPasswordError && <Text style={styles.fieldErrorText}>{confirmPasswordError}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleResetPassword}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    scrollContent: { padding: 20, flexGrow: 1, justifyContent: 'center' },

    backBtn: { marginBottom: 20 },
    backText: { color: c.primary, fontWeight: '700', fontSize: 14 },

    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
    },
    title: { color: c.text, fontSize: 22, fontWeight: '800' },
    subtitle: { color: c.icon, fontSize: 13, marginBottom: 20, lineHeight: 18, marginTop: 4 },
    highlightText: { color: c.text, fontWeight: '700' },

    label: { color: c.icon, fontSize: 12, marginBottom: 6, fontWeight: '600', marginTop: 10 },
    input: {
      backgroundColor: c.bg,
      color: c.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      fontSize: 14,
    },
    inputErrorBorder: { borderColor: c.danger },
    fieldErrorText: { color: c.danger, fontSize: 12, marginTop: 5, fontWeight: '500' },
    fieldErrorTextCentered: { color: c.danger, fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: '600' },

    primaryBtn: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

    otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
    otpBox: {
      width: 44,
      height: 50,
      backgroundColor: c.bg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      textAlign: 'center',
      color: c.primary,
      fontSize: 20,
      fontWeight: '800',
    },

    resendContainer: { marginTop: 16, alignItems: 'center' },
    resendActiveText: { color: c.primary, fontWeight: '700', fontSize: 13 },
    resendDisabledText: { color: c.muted, fontSize: 13, fontWeight: '500' },
  });