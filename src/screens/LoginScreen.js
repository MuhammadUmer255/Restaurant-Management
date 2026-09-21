import React, { useState, useRef } from 'react';
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
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/authValidation';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  // Role Selection State ('user' | 'admin')
  const [selectedRole, setSelectedRole] = useState('user');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Inline Field Errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Toast State & Animation
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    fadeAnim.stopAnimation();

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
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
      <StatusBar barStyle="light-content" backgroundColor="#070E20" translucent={false} />

      {/* Toast Banner */}
      {!!toastMessage && (
        <Animated.View
          style={[
            styles.toastContainer,
            toastType === 'success' ? styles.toastSuccess : styles.toastError,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.toastText}>
            {toastType === 'success' ? '✓ ' : '⚠️ '}
            {toastMessage}
          </Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back! 👋</Text>
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
              <Text
                style={[
                  styles.roleTabText,
                  selectedRole === 'user' && styles.roleTabTextActive,
                ]}
              >
                👤 Sign in as User
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleTab,
                selectedRole === 'admin' && styles.roleTabActive,
              ]}
              onPress={() => setSelectedRole('admin')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.roleTabText,
                  selectedRole === 'admin' && styles.roleTabTextActive,
                ]}
              >
                👑 Sign in as Admin
              </Text>
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
              placeholderTextColor="#68738D"
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
              placeholderTextColor="#68738D"
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
                <Text style={styles.btnText}>
                  {selectedRole === 'admin' ? 'Login as Admin ➔' : 'Login as User ➔'}
                </Text>
              )}
            </TouchableOpacity>

            {selectedRole === 'admin' && (
              <View style={styles.registerContainer}>
                <Text style={styles.registerSubText}>Don't have a restaurant account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                  <Text style={styles.registerText}>Register Restaurant</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070E20' },
  scrollContent: { padding: 20, flexGrow: 1, justifyContent: 'center' },

  toastContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 9999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  toastSuccess: { backgroundColor: '#1E3A2B', borderWidth: 1, borderColor: '#35D49B' },
  toastError: { backgroundColor: '#3A1822', borderWidth: 1, borderColor: '#FF526A' },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', textAlign: 'center' },

  headerContainer: { marginBottom: 20 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#8D96AA', fontSize: 13, lineHeight: 19 },

  /* Role Toggle Switcher */
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0D162C',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: '#FF7622',
  },
  roleTabText: {
    color: '#8D96AA',
    fontSize: 13,
    fontWeight: '700',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },

  card: {
    backgroundColor: '#0D162C',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#202D49',
  },

  label: { color: '#8D96AA', fontSize: 12, marginBottom: 6, fontWeight: '600', marginTop: 10 },
  input: {
    backgroundColor: '#070E20',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#202D49',
    fontSize: 14,
  },
  inputErrorBorder: { borderColor: '#FF526A' },
  fieldErrorText: { color: '#FF526A', fontSize: 12, marginTop: 5, fontWeight: '500' },

  forgotBtn: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 10 },
  forgotText: { color: '#FF7622', fontWeight: '700', fontSize: 13 },

  primaryBtn: {
    backgroundColor: '#FF7622',
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
  registerSubText: { color: '#8D96AA', fontSize: 13 },
  registerText: { color: '#FF7622', fontWeight: '700', fontSize: 13 },
});