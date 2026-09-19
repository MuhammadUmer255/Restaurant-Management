import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';

const INITIAL_EMPLOYEES = [
  { id: '1', name: 'John Doe', role: 'Head Chef', phone: '+1 555-0192', status: 'Active' },
  { id: '2', name: 'Sarah Smith', role: 'Waitress', phone: '+1 555-0143', status: 'Active' },
  { id: '3', name: 'Michael Brown', role: 'Bartender', phone: '+1 555-0188', status: 'On Leave' },
  { id: '4', name: 'Emma Wilson', role: 'Manager', phone: '+1 555-0121', status: 'Active' },
];

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  // Modal State for Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  // Toggle dropdown action buttons on list click
  const handleItemPress = (id) => {
    setSelectedEmpId((prevId) => (prevId === id ? null : id));
  };

  // Open modal to Add new employee
  const handleOpenAddModal = () => {
    setEditingEmp(null);
    setName('');
    setRole('');
    setPhone('');
    setModalVisible(true);
  };

  // Open modal to Edit existing employee
  const handleOpenEditModal = (emp) => {
    setEditingEmp(emp);
    setName(emp.name);
    setRole(emp.role);
    setPhone(emp.phone);
    setModalVisible(true);
  };

  // Save (Create or Update) logic
  const handleSaveEmployee = () => {
    if (!name.trim() || !role.trim()) {
      Alert.alert('Validation Error', 'Please enter employee name and role.');
      return;
    }

    if (editingEmp) {
      // Update existing record
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmp.id ? { ...emp, name, role, phone } : emp
        )
      );
    } else {
      // Create new record
      const newEmp = {
        id: Date.now().toString(),
        name,
        role,
        phone: phone || 'N/A',
        status: 'Active',
      };
      setEmployees((prev) => [newEmp, ...prev]);
    }

    setModalVisible(false);
  };

  // Delete employee logic
  const handleDelete = (emp) => {
    Alert.alert('Delete Employee', `Are you sure you want to delete ${emp.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setEmployees((prev) => prev.filter((item) => item.id !== emp.id));
          setSelectedEmpId(null);
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isSelected = item.id === selectedEmpId;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => handleItemPress(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.empName}>{item.name}</Text>
            <Text style={styles.statusBadge}>{item.status}</Text>
          </View>
          <View style={[styles.rowBetween, styles.mt8]}>
            <Text style={styles.roleText}>{item.role}</Text>
            <Text style={styles.phoneText}>{item.phone}</Text>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => handleOpenEditModal(item)}
            >
              <Text style={styles.actionBtnText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.addBtn]}
              onPress={handleOpenAddModal}
            >
              <Text style={styles.actionBtnText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.actionBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Employees Management</Text>
        <TouchableOpacity style={styles.topAddBtn} onPress={handleOpenAddModal}>
          <Text style={styles.topAddBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
      />

      {/* Add / Edit Form Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingEmp ? 'Edit Employee' : 'Add New Employee'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Employee Name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Role (e.g. Chef, Waiter)"
              value={role}
              onChangeText={setRole}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveModalBtn]}
                onPress={handleSaveEmployee}
              >
                <Text style={styles.actionBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  topAddBtn: {
    backgroundColor: '#38A169',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  topAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listPadding: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mt8: {
    marginTop: 8,
  },
  empName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F855A',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  phoneText: {
    fontSize: 14,
    color: '#718096',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  editBtn: {
    backgroundColor: '#3182CE',
  },
  addBtn: {
    backgroundColor: '#38A169',
  },
  deleteBtn: {
    backgroundColor: '#E53E3E',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#2D3748',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelModalBtn: {
    backgroundColor: '#EDF2F7',
  },
  saveModalBtn: {
    backgroundColor: '#3182CE',
  },
  cancelBtnText: {
    color: '#4A5568',
    fontWeight: '600',
  },
});