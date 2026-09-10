import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';

// ---------- COLORS (design se match) ----------
const COLORS = {
  bg: '#0d1220',
  card: '#131a2b',
  cardBorder: '#26314a',
  orange: '#ff7a1a',
  orangeSoft: 'rgba(255,122,26,0.12)',
  green: '#2ecc71',
  greenSoft: 'rgba(46,204,113,0.12)',
  textPrimary: '#ffffff',
  textSecondary: '#8b93a7',
  inputBg: '#0f1626',
};

export default function LoginScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'pin'
  const [email, setEmail] = useState('laurent@ateliergourmet.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepBound, setKeepBound] = useState(true);

  const handleSignIn = () => {
    // TODO: apna auth logic yahan call karein
    console.log('Sign in ->', { email, password, keepBound });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top status row */}
        <View style={styles.topRow}>
          <View style={styles.statusPill}>
            <View style={styles.dotGreen} />
            <Text style={styles.statusPillText}>POS Node: Cloud Active</Text>
          </View>
          <View style={styles.terminalPill}>
            <Text style={styles.terminalPillText}>T-01 #MAIN</Text>
          </View>
        </View>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🍴</Text>
            <View style={styles.logoDot} />
          </View>
        </View>

        {/* Brand */}
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>GourmetOS</Text>
          <View style={styles.enterprisePill}>
            <Text style={styles.enterprisePillText}>ENTERPRISE SUITE</Text>
          </View>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to manage your restaurant floor, kitchen{'\n'}tickets & staff dispatch.
        </Text>

        {/* Card */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'email' && styles.tabBtnActive]}
              onPress={() => setActiveTab('email')}
            >
              <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>
                Email & Pass
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'pin' && styles.tabBtnActive]}
              onPress={() => setActiveTab('pin')}
            >
              <Text style={[styles.tabText, activeTab === 'pin' && styles.tabTextActive]}>
                Staff PIN Pad
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'email' ? (
            <>
              {/* Email field */}
              <View style={styles.labelRow}>
                <Text style={styles.labelText}>@  Work Email or Staff ID</Text>
                <Text style={styles.labelHint}>Floor / Admin</Text>
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@restaurant.com"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              {/* Password field */}
              <Text style={[styles.labelText, { marginTop: 18 }]}>🔒  Terminal Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••••••"
                  placeholderTextColor={COLORS.textSecondary}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>

              {/* Checkbox + Forgot */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setKeepBound(!keepBound)}
                >
                  <View style={[styles.checkbox, keepBound && styles.checkboxChecked]}>
                    {keepBound && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Keep Terminal Bound</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign in button */}
              <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn}>
                <Text style={styles.signInText}>Sign In to Terminal  →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.pinPlaceholder}>
              <Text style={styles.pinPlaceholderText}>
                Staff PIN Pad yahan render hoga (numeric keypad component).
              </Text>
            </View>
          )}

          {/* Rush hour fast access */}
          <Text style={styles.rushText}>RUSH HOUR FAST ACCESS</Text>
          <View style={styles.fastAccessRow}>
            <TouchableOpacity style={styles.fastBtn}>
              <Text style={styles.fastBtnIcon}>🧾</Text>
              <Text style={styles.fastBtnText}>4-Digit PIN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fastBtn}>
              <Text style={[styles.fastBtnIcon, { color: COLORS.green }]}>📶</Text>
              <Text style={styles.fastBtnText}>Tap NFC Card</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            New location or franchise?{' '}
            <Text style={styles.footerLink}>Create Workspace →</Text>
          </Text>
          <Text style={styles.footerSmall}>
            🛡 256-Bit Restaurant Bank Grade POS • PCI-DSS Level 1
          </Text>
          <Text style={styles.footerSmall}>HautePOS OS v4.8.2 • Node ID #409-TX</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 20, paddingBottom: 40 },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenSoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(46,204,113,0.3)',
  },
  dotGreen: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green, marginRight: 6,
  },
  statusPillText: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  terminalPill: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  terminalPillText: { color: COLORS.textSecondary, fontSize: 12, fontFamily: 'monospace' },

  logoWrap: { alignItems: 'center', marginTop: 40 },
  logoBox: {
    width: 84, height: 84, borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  logoIcon: { fontSize: 34 },
  logoDot: {
    position: 'absolute', top: 10, right: 12,
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green,
  },

  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 10 },
  brandText: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '700' },
  enterprisePill: {
    backgroundColor: COLORS.orangeSoft,
    borderWidth: 1, borderColor: COLORS.orange,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8,
  },
  enterprisePillText: { color: COLORS.orange, fontSize: 10, fontWeight: '700' },

  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 16 },
  subtitle: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 18,
    marginTop: 28,
  },

  tabsRow: { flexDirection: 'row', backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.orange },
  tabText: { color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.orange },

  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 },
  labelText: { color: COLORS.textPrimary, fontWeight: '600' },
  labelHint: { color: COLORS.textSecondary, fontSize: 11, fontFamily: 'monospace' },

  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.textPrimary,
  },

  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  passwordInput: { flex: 1, color: COLORS.textPrimary, paddingVertical: 14 },
  eyeIcon: { fontSize: 18 },

  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  checkboxChecked: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  checkboxLabel: { color: COLORS.textPrimary },
  forgotText: { color: COLORS.orange, fontWeight: '600' },

  signInBtn: {
    backgroundColor: COLORS.orange,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 22,
  },
  signInText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  pinPlaceholder: { paddingVertical: 40, alignItems: 'center' },
  pinPlaceholderText: { color: COLORS.textSecondary, textAlign: 'center' },

  rushText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 26,
    marginBottom: 12,
  },
  fastAccessRow: { flexDirection: 'row', gap: 12 },
  fastBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 14,
  },
  fastBtnIcon: { color: COLORS.orange, marginRight: 8, fontSize: 16 },
  fastBtnText: { color: COLORS.textPrimary, fontWeight: '600' },

  footer: { alignItems: 'center', marginTop: 30 },
  footerText: { color: COLORS.textSecondary },
  footerLink: { color: COLORS.orange, fontWeight: '700' },
  footerSmall: { color: '#5a6379', fontSize: 11, marginTop: 10, textAlign: 'center' },
});