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
import { validateEmail, validatePassword, getPasswordErrorMessage } from '../utils/authValidation';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';

export default function RegisterScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Mode: 'admin' (Register Restaurant) | 'user' (Register Staff / User)
  const [selectedRole, setSelectedRole] = useState('admin');

  // Common & Admin Fields
  const [fullName, setFullName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [staffRole, setStaffRole] = useState('Waiter');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Inline Errors
  const [fullNameError, setFullNameError] = useState('');
  const [restaurantNameError, setRestaurantNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Floating Toast Notification
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

  const handleRegister = () => {
    let isValid = true;
    setFullNameError('');
    setRestaurantNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (selectedRole === 'admin') {
      if (!restaurantName.trim()) {
        setRestaurantNameError('Restaurant name is required.');
        isValid = false;
      }
    } else {
      if (!fullName.trim()) {
        setFullNameError('Full name is required.');
        isValid = false;
      }
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

    if (!isValid) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const successMsg =
        selectedRole === 'admin'
          ? 'Restaurant Admin account registered successfully!'
          : `Staff account (${staffRole}) registered successfully!`;

      showToast(successMsg, 'success');

      setTimeout(() => {
        navigation.navigate('LoginScreen');
      }, 1500);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
        translucent={false}
      />

      {/* Top Floating Toast */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onDismiss={hideToast}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="chevron-back-outline" size={16} color={colors.primary} />
              <Text style={styles.backText}>Back to Login</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={selectedRole === 'admin' ? 'business-outline' : 'person-add-outline'}
                size={26}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.title}>
                {selectedRole === 'admin' ? 'Register Restaurant' : 'Register Staff Account'}
              </Text>
            </View>
            <Text style={styles.subtitle}>
              {selectedRole === 'admin'
                ? 'Create your restaurant admin account to manage operations.'
                : 'Create a user / staff account to handle orders & tables.'}
            </Text>
          </View>

          {/* Role Switcher Tabs */}
          <View style={styles.roleToggleContainer}>
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
                  Register as Admin
                </Text>
              </View>
            </TouchableOpacity>

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
                  Register as User
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            {/* ADMIN INTERFACE FIELDS */}
            {selectedRole === 'admin' ? (
              <>
                <Text style={styles.label}>Restaurant Name</Text>
                <TextInput
                  style={[styles.input, restaurantNameError ? styles.inputErrorBorder : null]}
                  placeholder="e.g. Gourmet Bistro"
                  placeholderTextColor={colors.muted}
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
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {!!emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}
              </>
            ) : (
              /* USER / STAFF INTERFACE FIELDS */
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, fullNameError ? styles.inputErrorBorder : null]}
                  placeholder="e.g. Alex Johnson"
                  placeholderTextColor={colors.muted}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setFullNameError('');
                  }}
                />
                {!!fullNameError && <Text style={styles.fieldErrorText}>{fullNameError}</Text>}

                <Text style={styles.label}>Staff Work Email</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputErrorBorder : null]}
                  placeholder="staff@gourmetbistro.com"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {!!emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}

                <Text style={styles.label}>Staff Designation / Role</Text>
                <View style={styles.staffRoleRow}>
                  {['Waiter', 'Chef', 'Staff'].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.roleChip,
                        staffRole === r && styles.activeRoleChip,
                      ]}
                      onPress={() => setStaffRole(r)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.roleChipText,
                          staffRole === r && styles.activeRoleChipText,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputErrorBorder : null]}
              placeholder="Min 8 chars (e.g. Password@123)"
              placeholderTextColor={colors.muted}
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
              placeholderTextColor={colors.muted}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
              }}
              secureTextEntry
            />
            {!!confirmPasswordError && <Text style={styles.fieldErrorText}>{confirmPasswordError}</Text>}

            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.registerBtnText}>
                    {selectedRole === 'admin' ? 'Create Restaurant Account' : 'Create Staff Account'}
                  </Text>
                  <Ionicons name="arrow-forward-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    scrollContent: { padding: 20, justifyContent: 'center', flexGrow: 1 },

    backBtn: { marginBottom: 16 },
    backText: { color: c.primary, fontWeight: '700', fontSize: 14 },

    headerContainer: { marginBottom: 20 },
    title: { color: c.text, fontSize: 24, fontWeight: '800' },
    subtitle: { color: c.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },

    /* Role Switcher Tabs */
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
      fontSize: 12,
      fontWeight: '700',
    },
    roleTabTextActive: {
      color: '#FFFFFF',
    },

    formCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
    },
    label: { color: c.icon, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12 },
    input: {
      backgroundColor: c.bg,
      color: c.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      fontSize: 14,
    },
    inputErrorBorder: { borderColor: c.danger },
    fieldErrorText: { color: c.danger, fontSize: 12, marginTop: 4, fontWeight: '500' },

    staffRoleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
      marginBottom: 6,
    },
    roleChip: {
      flex: 1,
      backgroundColor: c.bg,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      marginHorizontal: 3,
    },
    activeRoleChip: {
      borderColor: c.primary,
      backgroundColor: 'rgba(255, 118, 34, 0.15)',
    },
    roleChipText: {
      color: c.icon,
      fontSize: 12,
      fontWeight: '600',
    },
    activeRoleChipText: {
      color: c.primary,
      fontWeight: '700',
    },

    registerBtn: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 22,
    },
    btnDisabled: { opacity: 0.6 },
    registerBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  });