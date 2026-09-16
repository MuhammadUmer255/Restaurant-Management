import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Temporary Frontend Success Flow
    Alert.alert('Success', 'Account registered successfully!', [
      { text: 'OK', onPress: () => navigation.navigate('LoginScreen') },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.brandTitle}>GourmetOS</Text>
          <Text style={styles.subtitle}>Create Staff Account</Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />

          <CustomInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <CustomInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <CustomButton title="Register Staff" onPress={handleRegister} />

          <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#070E20',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ff7a1a',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a5b5',
    marginTop: 6,
  },
  formContainer: {
    width: '100%',
  },
  loginLinkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#a0a5b5',
    fontSize: 14,
  },
  loginTextBold: {
    color: '#ff7a1a',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;