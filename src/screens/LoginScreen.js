import React, { useState, useMemo } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { validateEmail } from '../utils/authValidation';
import Toast from '../components/Toast';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { isDark, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Role Selection State ('user' | 'admin')
  const [selectedRole, setSelectedRole] = useState('user');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Inline Field Errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Toast State
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message, type = 'success') => {
    setToastConfig({ visible: true, message, type });
  };

  const hideToast = () => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  };

  const handleLogin = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showToast(`Signed in as ${selectedRole === 'admin' ? 'Admin Manager' : 'Staff / User'}!`, 'success');

      // Perform login in AuthContext with chosen role
      login({
        email: email,
        name: email.split('@')[0],
        role: selectedRole,
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
        translucent={false}
      />

      {/* Top Floating Toast Notification */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onDismiss={hideToast}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.title}>Welcome Back!</Text>
            </View>
            <Text style={styles.subtitle}>
              {selectedRole === 'admin'
                ? 'Sign in as Admin Manager for full access, CRUD & management.'
                : 'Sign in as User / Staff to view tables, menu & process orders.'}
            </Text>
          </View>

          {/* Role Switcher Tabs */}
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity
              style={[
                styles.roleTab,
                selectedRole === 'user' && styles.roleTabActive,
              ]}
              onPress={() => setSelectedRole('user')}
              activeOpacity={0.8}
            >
              <View style={styles.tabContentRow}>
                <Ionicons
                  name="person-outline"
                  size={15}
                  color={selectedRole === 'user' ? '#FFFFFF' : colors.icon}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.roleTabText,
                    selectedRole === 'user' && styles.roleTabTextActive,
                  ]}
                >
                  Sign in as User
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleTab,
                selectedRole === 'admin' && styles.roleTabActive,
              ]}
              onPress={() => setSelectedRole('admin')}
              activeOpacity={0.8}
            >
              <View style={styles.tabContentRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={15}
                  color={selectedRole === 'admin' ? '#FFFFFF' : colors.icon}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.roleTabText,
                    selectedRole === 'admin' && styles.roleTabTextActive,
                  ]}
                >
                  Sign in as Admin
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>
              {selectedRole === 'admin' ? 'Admin Email Address' : 'User / Staff Email'}
            </Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputErrorBorder : null]}
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                setEmailError('');
              }}
              placeholder={selectedRole === 'admin' ? 'admin@gourmet.com' : 'user@gourmet.com'}
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!!emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputErrorBorder : null]}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                setPasswordError('');
              }}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor={colors.muted}
            />
            {!!passwordError && <Text style={styles.fieldErrorText}>{passwordError}</Text>}

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPasswordScreen')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.btnText}>
                    {selectedRole === 'admin' ? 'Login as Admin' : 'Login as User'}
                  </Text>
                  <Ionicons name="arrow-forward-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerSubText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                <Text style={styles.registerText}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    scrollContent: { padding: 20, flexGrow: 1, justifyContent: 'center' },

    headerContainer: { marginBottom: 20 },
    title: { color: c.text, fontSize: 28, fontWeight: '800', marginBottom: 6 },
    subtitle: { color: c.icon, fontSize: 13, lineHeight: 19 },

    roleToggleContainer: {
      flexDirection: 'row',
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: c.border,
    },
    roleTab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    roleTabActive: {
      backgroundColor: c.primary,
    },
    tabContentRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    roleTabText: {
      color: c.icon,
      fontSize: 13,
      fontWeight: '700',
    },
    roleTabTextActive: {
      color: '#FFFFFF',
    },

    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
    },

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

    forgotBtn: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 10 },
    forgotText: { color: c.primary, fontWeight: '700', fontSize: 13 },

    primaryBtn: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    registerSubText: { color: c.icon, fontSize: 13 },
    registerText: { color: c.primary, fontWeight: '700', fontSize: 13 },
  });