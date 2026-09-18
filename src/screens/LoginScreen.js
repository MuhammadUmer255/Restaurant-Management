import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState('admin'); // 'admin' or 'staff'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');

  const handleLogin = () => {
    // 1. Email Validation
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // 2. Authentication Logic
    if (role === 'admin') {
      if (!password.trim()) {
        Alert.alert('Password Required', 'Please enter your admin password.');
        return;
      }

      // Demo Admin Auth Verification
      if (email.toLowerCase() === 'admin@gourmetos.com' && password === 'admin123') {
        navigation.replace('MainTabs', { role: 'admin' });
      } else {
        // Fallback demo approval for testing
        Alert.alert(
          'Login Successful',
          'Logged in as Admin (Demo Mode)',
          [
            {
              text: 'Continue',
              onPress: () => navigation.replace('MainTabs', { role: 'admin' }),
            },
          ]
        );
      }
    } else {
      // Staff / Waiter Mode Validation
      if (!pin.trim() || pin.length < 4) {
        Alert.alert('PIN Required', 'Please enter a valid 4-digit Staff PIN.');
        return;
      }

      // Demo Staff Auth Verification
      if (pin === '9999' || pin.length === 4) {
        navigation.replace('MainTabs', { role: 'user' });
      } else {
        Alert.alert('Error', 'Invalid Staff PIN. Try 9999.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Branding */}
          <View style={styles.brandContainer}>
            <Text style={styles.logoIcon}>🍴</Text>
            <Text style={styles.brandName}>GourmetOS</Text>
            <Text style={styles.brandTagline}>High-Performance POS System</Text>
          </View>

          {/* Role Selection Toggle */}
          <Text style={styles.label}>Select Login Mode</Text>
          <View style={styles.roleToggleRow}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'admin' && styles.activeRoleBtn]}
              onPress={() => setRole('admin')}
            >
              <Text style={[styles.roleBtnText, role === 'admin' && styles.activeRoleText]}>
                👑 Admin / Manager
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleBtn, role === 'staff' && styles.activeRoleBtn]}
              onPress={() => setRole('staff')}
            >
              <Text style={[styles.roleBtnText, role === 'staff' && styles.activeRoleText]}>
                👔 User
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder={role === 'admin' ? "admin@gourmetos.com" : "user@gourmetos.com"}
              placeholderTextColor="#778197"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {role === 'admin' ? (
              <>
                <Text style={styles.label}>Admin Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#778197"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>User Access PIN (e.g. 9999)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 4-digit PIN"
                  placeholderTextColor="#778197"
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>
                Login as {role === 'admin' ? 'Admin' : 'User'} ➔
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register Redirect */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
              <Text style={styles.registerLink}>Register Restaurant</Text>
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
  brandContainer: { alignItems: 'center', marginBottom: 30 },
  logoIcon: { fontSize: 48 },
  brandName: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 8 },
  brandTagline: { color: '#7D879D', fontSize: 13, marginTop: 4 },
  label: { color: '#8D96AA', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  roleToggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  roleBtn: {
    flex: 0.48,
    backgroundColor: '#101A31',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#202D49',
  },
  activeRoleBtn: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
  roleBtnText: { color: '#8D96AA', fontSize: 13, fontWeight: '700' },
  activeRoleText: { color: '#FFFFFF' },
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#202D49',
    marginBottom: 8,
  },
  loginBtn: {
    backgroundColor: '#FF7622',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  loginBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#7D879D' },
  registerLink: { color: '#FF7622', fontWeight: 'bold' },
});