import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { validateEmail, validatePassword, getPasswordErrorMessage } from '../utils/authValidation';

export default function RegisterScreen({ navigation }) {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Inline Errors
  const [restaurantNameError, setRestaurantNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);

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

  const handleRegister = () => {
    let isValid = true;
    setRestaurantNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!restaurantName.trim()) {
      setRestaurantNameError('Restaurant name is required.');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!validatePassword(password)) {
      setPasswordError(getPasswordErrorMessage(password));
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    if (isValid) {
      showToast('Restaurant registered successfully! Redirecting...', 'success');
      setTimeout(() => {
        navigation.navigate('LoginScreen');
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Toast Notification */}
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹ Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Register Restaurant 🏢</Text>
            <Text style={styles.subtitle}>Create your admin account to get started with GourmetOS.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              style={[styles.input, restaurantNameError ? styles.inputErrorBorder : null]}
              placeholder="e.g. Gourmet Bistro"
              placeholderTextColor="#778197"
              value={restaurantName}
              onChangeText={(text) => {
                setRestaurantName(text);
                setRestaurantNameError('');
              }}
            />
            {!!restaurantNameError && <Text style={styles.fieldErrorText}>{restaurantNameError}</Text>}

            <Text style={styles.label}>Admin Email Address</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputErrorBorder : null]}
              placeholder="admin@gourmetbistro.com"
              placeholderTextColor="#778197"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!!emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}

            <Text style={styles.label}>Admin Password</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputErrorBorder : null]}
              placeholder="Min 8 chars (e.g. Admin@123)"
              placeholderTextColor="#778197"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry
            />
            {!!passwordError && <Text style={styles.fieldErrorText}>{passwordError}</Text>}

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, confirmPasswordError ? styles.inputErrorBorder : null]}
              placeholder="Re-enter password"
              placeholderTextColor="#778197"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
              }}
              secureTextEntry
            />
            {!!confirmPasswordError && <Text style={styles.fieldErrorText}>{confirmPasswordError}</Text>}

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.8}>
              <Text style={styles.registerBtnText}>Create Restaurant Account ➔</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070E20' },
  scrollContent: { padding: 20, justifyContent: 'center', flexGrow: 1 },

  toastContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 9999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  toastSuccess: { backgroundColor: '#1E3A2B', borderWidth: 1, borderColor: '#35D49B' },
  toastError: { backgroundColor: '#3A1822', borderWidth: 1, borderColor: '#FF526A' },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', textAlign: 'center' },

  backBtn: { marginBottom: 16 },
  backText: { color: '#FF7622', fontWeight: '700', fontSize: 14 },

  headerContainer: { marginBottom: 20 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#7D879D', fontSize: 13, lineHeight: 18 },

  label: { color: '#8D96AA', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  formCard: {
    backgroundColor: '#0D162C',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  input: {
    backgroundColor: '#070E20',
    color: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#202D49',
    fontSize: 14,
  },
  inputErrorBorder: { borderColor: '#FF526A' },
  fieldErrorText: { color: '#FF526A', fontSize: 12, marginTop: 4, fontWeight: '500' },

  registerBtn: {
    backgroundColor: '#FF7622',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 22,
  },
  registerBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});