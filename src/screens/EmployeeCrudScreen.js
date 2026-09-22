import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  TouchableWithoutFeedback,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast'; 

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INITIAL_EMPLOYEES = [
  { id: '1', name: 'Elena S.', role: 'Head Waiter', email: 'elena@gourmet.com', active: true },
  { id: '2', name: 'Julien M.', role: 'Manager', email: 'julien@gourmet.com', active: true },
  { id: '3', name: 'Laurent Mercier', role: 'Head Chef', email: 'laurent@gourmet.com', active: true },
];

const ROLES_LIST = ['Waiter', 'Head Waiter', 'Chef', 'Head Chef', 'Manager'];

const EmployeeCrudScreen = ({ route, navigation }) => {
  const authContext = useAuth ? useAuth() : {};
  const currentRole = route?.params?.role || authContext?.userRole || 'admin';
  const isAdmin = currentRole === 'admin';

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  // Track expanded card for detail & button display
  const [expandedId, setExpandedId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Waiter');
  const [active, setActive] = useState(true);

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

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#070E20" translucent={false} />
        <View style={styles.restrictedContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.restrictedTitle}>Access Restricted</Text>
          <Text style={styles.restrictedText}>
            You do not have access to Employee Management. This module is restricted to System Admins.
          </Text>
          <TouchableOpacity
            style={styles.goBackBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setRole('Waiter');
    setActive(true);
    setModalVisible(true);
  };

  const openEditModal = (emp) => {
    setEditingId(emp.id);
    setName(emp.name);
    setEmail(emp.email);
    setRole(emp.role);
    setActive(emp.active);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (editingId) {
      setEmployees(employees.map((e) => (e.id === editingId ? { ...e, name, email, role, active } : e)));
      showToast(`${name}'s profile updated!`, 'success');
    } else {
      const newEmp = {
        id: Date.now().toString(),
        name,
        email,
        role,
        active,
      };
      setEmployees([...employees, newEmp]);
      showToast(`${name} added to staff!`, 'success');
    }
    setModalVisible(false);
  };

  const openDeleteModal = (emp) => {
    setDeletingEmployee(emp);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = () => {
    if (deletingEmployee) {
      const empName = deletingEmployee.name;
      setEmployees(employees.filter((e) => e.id !== deletingEmployee.id));
      setDeleteConfirmVisible(false);
      setDeletingEmployee(null);
      showToast(`${empName} removed from staff!`, 'error');
    }
  };

  const filteredEmployees = employees.filter((e) => {
    if (selectedRoleFilter === 'All') return true;
    return e.role.toLowerCase().split(' ').includes(selectedRoleFilter.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#070E20" translucent={false} />

      {/* Top Floating Toast Notification */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onDismiss={hideToast}
      />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1}>Employee Management</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Role Filter Chips */}
      <View style={{ height: 40, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {['All', 'Waiter', 'Chef', 'Manager'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, selectedRoleFilter === filter && styles.activeFilterChip]}
              onPress={() => setSelectedRoleFilter(filter)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, selectedRoleFilter === filter && styles.activeFilterChipText]}>
                {filter === 'All' ? 'All' : `${filter}s`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Staff List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredEmployees.map((emp) => {
          const isExpanded = expandedId === emp.id;

          return (
            <TouchableOpacity
              key={emp.id}
              style={styles.card}
              onPress={() => toggleExpand(emp.id)}
              activeOpacity={0.9}
            >
              <View style={styles.empDetails}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{emp.name ? emp.name.charAt(0).toUpperCase() : '?'}</Text>
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.empName} numberOfLines={1}>{emp.name}</Text>
                    <View style={[styles.statusDot, { backgroundColor: emp.active ? '#35D49B' : '#FF526A' }]} />
                  </View>
                  <Text style={styles.empRole}>{emp.role}</Text>
                  <Text style={styles.empEmail} numberOfLines={1}>{emp.email}</Text>
                </View>
                <Text style={styles.expandChevron}>{isExpanded ? '▲' : '▼'}</Text>
              </View>

              {/* Detailed View & Action Buttons - Only rendered on tap */}
              {isExpanded && (
                <View style={styles.detailsContainer}>
                  <View style={styles.divider} />

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status:</Text>
                    <Text style={[styles.infoValue, { color: emp.active ? '#35D49B' : '#FF526A' }]}>
                      {emp.active ? 'Active Employee' : 'Inactive / Suspended'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{emp.email}</Text>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(emp)} activeOpacity={0.7}>
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => openDeleteModal(emp)} activeOpacity={0.7}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteConfirmVisible} animationType="fade" transparent onRequestClose={() => setDeleteConfirmVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDeleteConfirmVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Staff Member</Text>
              <Text style={{ color: '#7E879B', fontSize: 13, marginBottom: 16 }}>
                Are you sure you want to remove <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{deletingEmployee?.name}</Text> from employee management?
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setDeleteConfirmVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveModalBtn, { backgroundColor: '#FF526A' }]} onPress={confirmDelete} activeOpacity={0.8}>
                  <Text style={styles.saveText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Employee' : 'Add New Employee'}</Text>

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. John Doe"
                placeholderTextColor="#778197"
              />

              <Text style={styles.label}>Work Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="email@gourmet.com"
                placeholderTextColor="#778197"
              />

              <Text style={styles.label}>Role</Text>
              <View style={styles.rolePickerRow}>
                {ROLES_LIST.map((r, index) => (
                  <TouchableOpacity
                    key={`${r}-${index}`}
                    style={[styles.roleChip, role === r && styles.activeRoleChip]}
                    onPress={() => setRole(r)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.roleChipText, role === r && styles.activeRoleChipText]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchRow}>
                <Text style={[styles.label, { marginTop: 0 }]}>Active Status</Text>
                <Switch
                  value={active}
                  onValueChange={setActive}
                  trackColor={{ false: '#202D49', true: 'rgba(255, 118, 34, 0.4)' }}
                  thumbColor={active ? '#FF7622' : '#8D96AA'}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave} activeOpacity={0.8}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070E20' },

  // Header UI
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#131D35',
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backText: { color: '#FF7622', fontSize: 16, fontWeight: '600' },
  titleWrapper: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  title: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  addBtn: { backgroundColor: '#FF7622', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  // Filter Bar
  filterRow: { paddingHorizontal: 16, alignItems: 'center' },
  filterChip: {
    backgroundColor: '#101A31',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  activeFilterChip: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
  filterChipText: { color: '#8D96AA', fontSize: 12, fontWeight: '500' },
  activeFilterChipText: { color: '#FFF', fontWeight: '700' },

  // Card & List
  listContainer: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 30 },
  card: {
    backgroundColor: '#0D162C',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  empDetails: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 118, 34, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FF7622', fontSize: 16, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  empName: { color: '#FFF', fontSize: 15, fontWeight: '700', marginRight: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  empRole: { color: '#FF7622', fontSize: 12, marginVertical: 2, fontWeight: '600' },
  empEmail: { color: '#7E879B', fontSize: 11 },
  expandChevron: { color: '#7E879B', fontSize: 12, paddingLeft: 8 },

  // Expandable Details Area
  detailsContainer: { marginTop: 12 },
  divider: { height: 1, backgroundColor: '#202D49', marginBottom: 12 },
  infoRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'center' },
  infoLabel: { color: '#7E879B', fontSize: 12, width: 60, fontWeight: '600' },
  infoValue: { color: '#FFF', fontSize: 12, fontWeight: '500' },

  // Actions Row inside Expansion
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  editBtn: {
    backgroundColor: 'rgba(53, 212, 155, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(53, 212, 155, 0.3)',
  },
  editText: { color: '#35D49B', fontSize: 12, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: 'rgba(255, 82, 106, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 106, 0.3)',
  },
  deleteText: { color: '#FF526A', fontSize: 12, fontWeight: '700' },

  // Modal Dialog
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#0D162C', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#202D49' },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  label: { color: '#8D96AA', fontSize: 12, marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#070E20', color: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#202D49', fontSize: 13 },
  rolePickerRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  roleChip: { backgroundColor: '#070E20', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6, marginBottom: 6, borderWidth: 1, borderColor: '#202D49' },
  activeRoleChip: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
  roleChipText: { color: '#8D96AA', fontSize: 11 },
  activeRoleChipText: { color: '#FFF', fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 22, alignItems: 'center' },
  cancelModalBtn: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  cancelText: { color: '#8D96AA', fontWeight: '600' },
  saveModalBtn: { backgroundColor: '#FF7622', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: '#FFF', fontWeight: '700' },

  // Security View
  restrictedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  lockIcon: { fontSize: 44, marginBottom: 16 },
  restrictedTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  restrictedText: { color: '#8D96AA', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  goBackBtn: { backgroundColor: '#FF7622', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  goBackText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

export default EmployeeCrudScreen;