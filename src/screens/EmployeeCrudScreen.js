import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';

const INITIAL_EMPLOYEES = [
  { id: '1', name: 'Elena S.', role: 'Head Waiter', email: 'elena@gourmet.com', active: true },
  { id: '2', name: 'Julien M.', role: 'Manager', email: 'julien@gourmet.com', active: true },
  { id: '3', name: 'Laurent Mercier', role: 'Head Chef', email: 'laurent@gourmet.com', active: true },
];

const ROLES_LIST = ['Waiter', 'Head Waiter', 'Chef', 'Head Chef', 'Manager'];

const EmployeeCrudScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Waiter');
  const [active, setActive] = useState(true);

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
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (editingId) {
      setEmployees(employees.map(e => e.id === editingId ? { ...e, name, email, role, active } : e));
    } else {
      const newEmp = {
        id: Date.now().toString(),
        name,
        email,
        role,
        active,
      };
      setEmployees([...employees, newEmp]);
    }
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Staff', 'Are you sure you want to remove this employee?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setEmployees(employees.filter(e => e.id !== id)) },
    ]);
  };

  const filteredEmployees = employees.filter(e => {
    if (selectedRoleFilter === 'All') return true;
    return e.role.toLowerCase().includes(selectedRoleFilter.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Employee Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Role Filter Buttons */}
      <View style={styles.filterRow}>
        {['All', 'Waiter', 'Chef', 'Manager'].map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, selectedRoleFilter === filter && styles.activeFilterChip]}
            onPress={() => setSelectedRoleFilter(filter)}
          >
            <Text style={[styles.filterChipText, selectedRoleFilter === filter && styles.activeFilterChipText]}>
              {filter === 'All' ? 'All' : `${filter}s`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Staff List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredEmployees.map(emp => (
          <View key={emp.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.empName}>{emp.name}</Text>
                <View style={[styles.statusDot, { backgroundColor: emp.active ? '#00E676' : '#FF5252' }]} />
              </View>
              <Text style={styles.empRole}>{emp.role}</Text>
              <Text style={styles.empEmail}>{emp.email}</Text>
            </View>

            <View style={styles.actionCol}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(emp)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(emp.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
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
                placeholderTextColor="#666" 
              />

              <Text style={styles.label}>Work Email</Text>
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none"
                placeholder="email@gourmet.com" 
                placeholderTextColor="#666" 
              />

              <Text style={styles.label}>Role</Text>
              <View style={styles.rolePickerRow}>
                {ROLES_LIST.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, role === r && styles.activeRoleChip]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[styles.roleChipText, role === r && styles.activeRoleChipText]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Active Status</Text>
                <Switch 
                  value={active} 
                  onValueChange={setActive} 
                  trackColor={{ false: '#767577', true: 'rgba(255, 107, 0, 0.4)' }}
                  thumbColor={active ? '#FF6B00' : '#f4f3f4'} 
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}>
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
  container: { flex: 1, backgroundColor: '#0B101D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  backBtn: { padding: 4 },
  backText: { color: '#FF6B00', fontSize: 16, fontWeight: '600' },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#FF6B00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addBtnText: { color: '#FFF', fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 },
  filterChip: { backgroundColor: '#161D2F', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  activeFilterChip: { backgroundColor: '#FF6B00' },
  filterChipText: { color: '#8A94A6', fontSize: 12 },
  activeFilterChipText: { color: '#FFF', fontWeight: 'bold' },
  listContainer: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: '#161D2F', padding: 14, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  empName: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginRight: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  empRole: { color: '#FF6B00', fontSize: 12, marginVertical: 2, fontWeight: '500' },
  empEmail: { color: '#8A94A6', fontSize: 11 },
  actionCol: { justifyContent: 'space-between', alignItems: 'flex-end' },
  editBtn: { backgroundColor: '#1E2638', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  editText: { color: '#00E676', fontSize: 11, fontWeight: '600' },
  deleteBtn: { marginTop: 6 },
  deleteText: { color: '#FF5252', fontSize: 11, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#161D2F', padding: 20, borderRadius: 12 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: '#8A94A6', fontSize: 12, marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#0B101D', color: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2A3447' },
  rolePickerRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6 },
  roleChip: { backgroundColor: '#0B101D', padding: 8, borderRadius: 6, marginRight: 6, marginBottom: 6, borderWidth: 1, borderColor: '#2A3447' },
  activeRoleChip: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  roleChipText: { color: '#8A94A6', fontSize: 11 },
  activeRoleChipText: { color: '#FFF', fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  cancelModalBtn: { padding: 10, marginRight: 10 },
  cancelText: { color: '#8A94A6' },
  saveModalBtn: { backgroundColor: '#FF6B00', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: '#FFF', fontWeight: 'bold' },
});

export default EmployeeCrudScreen;