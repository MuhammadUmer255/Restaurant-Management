import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // NEW
import Toast from '../components/Toast';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { isDark, colors, toggleTheme } = useTheme(); // NEW
  const styles = useMemo(() => makeStyles(colors), [colors]); // NEW

  // Role detection (Admin vs User)
  const userRole = user?.role || 'user';
  const isAdmin = userRole === 'admin';

  // Toggle states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutVisible, setLogoutVisible] = useState(false);

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

  // Logout button dabane par pehle confirmation dialog khulega
  const handleLogout = () => {
    setLogoutVisible(true);
  };

  // "Yes, Logout" dabane par toast dikhao, phir logout karo
  const confirmLogout = () => {
    setLogoutVisible(false);
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
      logout();
    }, 1500);
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

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-back-outline" size={18} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Account Profile</Text>

        <View style={styles.roleBadgeHeader}>
          <Text style={styles.roleBadgeHeaderText}>
            {isAdmin ? 'ADMIN' : 'STAFF'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person'}
              size={42}
              color={colors.primary}
            />
          </View>
          <Text style={styles.userName}>{user?.name || (isAdmin ? 'Admin Manager' : 'Staff User')}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@gourmetos.com'}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, isAdmin ? styles.adminBadgeBg : styles.userBadgeBg]}>
              <Text style={[styles.statusBadgeText, isAdmin ? styles.adminBadgeText : styles.userBadgeText]}>
                {isAdmin ? '⚡ System Administrator' : '👤 Staff Member'}
              </Text>
            </View>
          </View>
        </View>

        {/* Dynamic Detail Cards: ADMIN vs USER */}
        {isAdmin ? (
          /* ADMIN DETAILS SECTION */
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Restaurant & System Overview</Text>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="restaurant-outline" size={18} color={colors.icon} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Restaurant Name</Text>
                <Text style={styles.infoValue}>GourmetOS Main Branch</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={18} color={colors.icon} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Manageable Modules</Text>
                <Text style={styles.infoValue}>Tables, Menu & Employee CRUD</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="key-outline" size={18} color={colors.icon} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Access Level</Text>
                <Text style={styles.infoValue}>Full Admin Privileges</Text>
              </View>
            </View>
          </View>
        ) : (
          /* USER DETAILS SECTION */
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Staff Work Info</Text>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={18} color={colors.icon} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Assigned Designation</Text>
                <Text style={styles.infoValue}>{user?.designation || 'Floor Staff / Waiter'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={colors.icon} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Shift Status</Text>
                <Text style={[styles.infoValue, { color: colors.success }]}>● Active On-Duty</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={colors.icon} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Work Area</Text>
                <Text style={styles.infoValue}>Indoor & Patio Dining</Text>
              </View>
            </View>
          </View>
        )}

        {/* Preferences Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.divider} />

          {/* NEW: Dark / Light Mode Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={isDark ? 'moon-outline' : 'sunny-outline'}
                size={18}
                color={colors.icon}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.settingLabel}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.switchOff, true: 'rgba(255, 118, 34, 0.4)' }}
              thumbColor={isDark ? colors.primary : colors.icon}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="notifications-outline" size={18} color={colors.icon} style={{ marginRight: 10 }} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.switchOff, true: 'rgba(255, 118, 34, 0.4)' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.icon}
            />
          </View>

          <TouchableOpacity
            style={styles.settingClickRow}
            onPress={() => showToast('Password reset link sent to your email.', 'success')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.icon} style={{ marginRight: 10 }} />
              <Text style={styles.settingLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Logout from Account</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Modal
        visible={logoutVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setLogoutVisible(false)}
      >
        <TouchableOpacity
          style={styles.dialogOverlay}
          activeOpacity={1}
          onPress={() => setLogoutVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.dialogCard}>
              <View style={styles.dialogIconCircle}>
                <Ionicons name="log-out-outline" size={26} color={colors.danger} />
              </View>
              <Text style={styles.dialogTitle}>Logout?</Text>
              <Text style={styles.dialogMessage}>
                Are you sure you want to logout from your account?
              </Text>

              <View style={styles.dialogActions}>
                <TouchableOpacity
                  style={styles.dialogCancelBtn}
                  onPress={() => setLogoutVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dialogConfirmBtn}
                  onPress={confirmLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dialogConfirmText}>Yes, Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// Styles ab function hain taake colors theme ke hisaab se badlein
const makeStyles = (c) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },

    header: {
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'android' ? 8 : 12,
      paddingBottom: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: c.headerBorder,
    },
    backBtn: { paddingVertical: 4, paddingRight: 8 },
    backText: { color: c.primary, fontSize: 15, fontWeight: '600' },
    headerTitle: { color: c.text, fontSize: 17, fontWeight: '700' },
    roleBadgeHeader: {
      backgroundColor: c.badgeBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    roleBadgeHeaderText: { color: c.primary, fontSize: 10, fontWeight: '800' },

    content: { padding: 16, paddingBottom: 40 },

    profileCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 14,
    },
    avatarLarge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 118, 34, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1.5,
      borderColor: c.primary,
    },
    userName: { color: c.text, fontSize: 20, fontWeight: '800' },
    userEmail: { color: c.muted, fontSize: 13, marginTop: 2 },
    badgeRow: { marginTop: 12 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
    adminBadgeBg: { backgroundColor: 'rgba(255, 118, 34, 0.15)', borderColor: 'rgba(255, 118, 34, 0.3)' },
    adminBadgeText: { color: c.primary, fontWeight: '700', fontSize: 11 },
    userBadgeBg: { backgroundColor: 'rgba(53, 212, 155, 0.15)', borderColor: 'rgba(53, 212, 155, 0.3)' },
    userBadgeText: { color: c.success, fontWeight: '700', fontSize: 11 },

    sectionCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    sectionTitle: { color: c.text, fontSize: 14, fontWeight: '700' },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 12 },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    infoIcon: { marginRight: 12 },
    infoLabel: { color: c.muted, fontSize: 11, fontWeight: '500' },
    infoValue: { color: c.text, fontSize: 13, fontWeight: '600', marginTop: 1 },

    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
    settingClickRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginTop: 4 },
    settingLabel: { color: c.label, fontSize: 13, fontWeight: '600' },

    logoutBtn: {
      backgroundColor: 'rgba(255, 82, 106, 0.12)',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 82, 106, 0.3)',
      marginTop: 6,
    },
    logoutText: { color: c.danger, fontSize: 14, fontWeight: '700' },

    // Logout dialog
    dialogOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    dialogCard: {
      width: '100%',
      backgroundColor: c.card,
      borderRadius: 20,
      padding: 22,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    dialogIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 82, 106, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    dialogTitle: { color: c.text, fontSize: 19, fontWeight: '800' },
    dialogMessage: {
      color: c.muted,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 19,
      marginTop: 6,
      marginBottom: 20,
    },
    dialogActions: { flexDirection: 'row', width: '100%' },
    dialogCancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: c.chip,
      borderWidth: 1,
      borderColor: c.border,
      marginRight: 8,
    },
    dialogCancelText: { color: c.label, fontWeight: '700', fontSize: 14 },
    dialogConfirmBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: c.danger,
      marginLeft: 8,
    },
    dialogConfirmText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  });