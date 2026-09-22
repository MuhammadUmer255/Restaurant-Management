import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const INITIAL_TABLES = [
  { id: '1', number: 'Table 1', seats: 2, status: 'Available', area: 'Indoor' },
  { id: '2', number: 'Table 2', seats: 4, status: 'Occupied', area: 'Indoor' },
  { id: '3', number: 'Table 3', seats: 6, status: 'Reserved', area: 'Patio' },
  { id: '4', number: 'Table 4', seats: 4, status: 'Available', area: 'VIP' },
];

const AREAS = ['All', 'Indoor', 'Patio', 'VIP'];

export default function TableCrudScreen({ route, navigation }) {
  // Role Detection
  const authContext = useAuth ? useAuth() : {};
  const currentRole = route?.params?.role || authContext?.userRole || 'admin';
  const isAdmin = currentRole === 'admin';

  const [tables, setTables] = useState(INITIAL_TABLES);
  const [selectedArea, setSelectedArea] = useState('All');

  // Active Selected Item State
  const [selectedTable, setSelectedTable] = useState(null);

  // Modal Visibilities
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); // 'EDIT' or 'ADD'

  // Input States
  const [tableNumber, setTableNumber] = useState('');
  const [seats, setSeats] = useState('');
  const [area, setArea] = useState('Indoor');

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

  // Filter Tables
  const filteredTables = tables.filter(
    (t) => selectedArea === 'All' || t.area === selectedArea
  );

  // 1. User taps a Table Card
  const handleTablePress = (table) => {
    if (!isAdmin) return;
    setSelectedTable(table);
    setActionMenuVisible(true);
  };

  // 2. User taps top "+ Add Table"
  const openAddModal = () => {
    setSelectedTable(null);
    setCurrentAction('ADD');
    setTableNumber('');
    setSeats('');
    setArea('Indoor');
    setFormModalVisible(true);
  };

  // 3. Action Sheet Choice
  const handleSelectAction = (action) => {
    setActionMenuVisible(false);

    if (action === 'DELETE') {
      setDeleteConfirmVisible(true);
      return;
    }

    if (action === 'TOGGLE_STATUS') {
      if (selectedTable) {
        toggleStatus(selectedTable.id);
      }
      return;
    }

    setCurrentAction(action);

    if (action === 'EDIT' && selectedTable) {
      setTableNumber(selectedTable.number);
      setSeats(selectedTable.seats.toString());
      setArea(selectedTable.area);
    } else {
      setTableNumber('');
      setSeats('');
      setArea('Indoor');
    }

    setFormModalVisible(true);
  };

  // Confirm Delete Handler
  const confirmDeleteTable = () => {
    if (selectedTable) {
      const tableName = selectedTable.number;
      setTables((prev) => prev.filter((t) => t.id !== selectedTable.id));
      setDeleteConfirmVisible(false);
      setSelectedTable(null);
      showToast(`${tableName} deleted successfully!`, 'error');
    }
  };

  // 4. Save Details in Form Modal
  const handleSaveTable = () => {
    if (!tableNumber.trim() || !seats.trim()) {
      showToast('Please enter table name/number and seats count.', 'error');
      return;
    }

    const parsedSeats = parseInt(seats, 10);
    if (isNaN(parsedSeats) || parsedSeats <= 0) {
      showToast('Please enter a valid number of seats.', 'error');
      return;
    }

    if (currentAction === 'EDIT' && selectedTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === selectedTable.id
            ? { ...t, number: tableNumber, seats: parsedSeats, area }
            : t
        )
      );
      showToast(`${tableNumber} updated successfully!`, 'success');
    } else {
      const newTable = {
        id: Date.now().toString(),
        number: tableNumber,
        seats: parsedSeats,
        status: 'Available',
        area,
      };
      setTables((prev) => [newTable, ...prev]);
      showToast(`${tableNumber} added successfully!`, 'success');
    }

    setFormModalVisible(false);
    setSelectedTable(null);
  };

  const toggleStatus = (id) => {
    const statuses = ['Available', 'Occupied', 'Reserved'];
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextIndex = (statuses.indexOf(t.status) + 1) % statuses.length;
          const nextStatus = statuses[nextIndex];
          showToast(`${t.number} status changed to ${nextStatus}`, 'success');
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available':
        return { bg: 'rgba(53, 212, 155, 0.15)', text: '#35D49B', border: 'rgba(53, 212, 155, 0.3)' };
      case 'Occupied':
        return { bg: 'rgba(255, 82, 106, 0.15)', text: '#FF526A', border: 'rgba(255, 82, 106, 0.3)' };
      case 'Reserved':
        return { bg: 'rgba(245, 174, 34, 0.15)', text: '#F5AE22', border: 'rgba(245, 174, 34, 0.3)' };
      default:
        return { bg: '#101A31', text: '#7E879B', border: '#202D49' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#070E20" translucent={false} />

      {/* Top Floating Toast */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onDismiss={hideToast}
      />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => navigation?.goBack()} 
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        
        <View style={styles.roleBadgeContainer}>
          <Text style={styles.roleBadgeText}>
            {isAdmin ? '⚡ Admin Mode' : ' Customer View'}
          </Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            Table Management
          </Text>
          <Text style={styles.subtitle}>
            {filteredTables.length} tables listed
          </Text>
        </View>

        {isAdmin && (
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={openAddModal}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ Add Table</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Filter Chips */}
      <View style={{ height: 42, marginBottom: 8 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {AREAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedArea === cat && styles.activeCategoryChip,
              ]}
              onPress={() => setSelectedArea(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedArea === cat && styles.activeCategoryChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tables List */}
      <FlatList
        data={filteredTables}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const statusColors = getStatusStyle(item.status);
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={isAdmin ? 0.7 : 1}
              onPress={() => handleTablePress(item)}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.tableName}>{item.number}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors.bg, borderColor: statusColors.border },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.areaText}>Area: {item.area}</Text>
                <Text style={styles.seatsText}>{item.seats} Seats</Text>
              </View>

              {isAdmin && (
                <View style={styles.tapIndicator}>
                  <Text style={styles.tapIndicatorText}>Manage ›</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* STEP 1: Action Context Sheet Modal */}
      {isAdmin && (
        <Modal
          visible={actionMenuVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setActionMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActionMenuVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedTable?.number || 'Table Options'}
                </Text>
                <Text style={styles.modalSubtitle}>Select an action to perform:</Text>

                <TouchableOpacity
                  style={[styles.sheetOptionBtn, styles.editOptionBtn]}
                  onPress={() => handleSelectAction('EDIT')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editOptionText}>Edit Table Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sheetOptionBtn, styles.toggleOptionBtn]}
                  onPress={() => handleSelectAction('TOGGLE_STATUS')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toggleOptionText}>
                    Cycle Status ({selectedTable?.status})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sheetOptionBtn, styles.deleteOptionBtn]}
                  onPress={() => handleSelectAction('DELETE')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteOptionText}>Delete Table</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelSheetBtn}
                  onPress={() => setActionMenuVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      )}

      {/* STEP 2: Custom Delete Confirmation Modal */}
      {isAdmin && (
        <Modal
          visible={deleteConfirmVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setDeleteConfirmVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDeleteConfirmVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Delete Table</Text>
                <Text style={styles.modalSubtitle}>
                  Are you sure you want to remove {selectedTable?.number}?
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelModalBtn}
                    onPress={() => setDeleteConfirmVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveModalBtn, { backgroundColor: '#FF526A' }]}
                    onPress={confirmDeleteTable}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      )}

      {/* STEP 3: Detail Input Modal */}
      {isAdmin && (
        <Modal
          visible={formModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setFormModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setFormModalVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {currentAction === 'EDIT' ? 'Edit Table' : 'Add New Table'}
                </Text>

                <Text style={styles.label}>Table Name / Number</Text>
                <TextInput
                  style={styles.input}
                  value={tableNumber}
                  onChangeText={setTableNumber}
                  placeholder="e.g. Table 5"
                  placeholderTextColor="#778197"
                />

                <Text style={styles.label}>Capacity (Seats)</Text>
                <TextInput
                  style={styles.input}
                  value={seats}
                  onChangeText={setSeats}
                  keyboardType="numeric"
                  placeholder="4"
                  placeholderTextColor="#778197"
                />

                <Text style={styles.label}>Area Section</Text>
                <View style={styles.chipRow}>
                  {AREAS.filter((a) => a !== 'All').map((a) => (
                    <TouchableOpacity
                      key={a}
                      style={[
                        styles.chip,
                        area === a && styles.activeChip,
                      ]}
                      onPress={() => setArea(a)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          area === a && styles.activeChipText,
                        ]}
                      >
                        {a}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelModalBtn}
                    onPress={() => setFormModalVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveModalBtn}
                    onPress={handleSaveTable}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveText}>Save Table</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070E20' },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    paddingBottom: 4,
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backText: { color: '#FF7622', fontSize: 16, fontWeight: '600' },
  roleBadgeContainer: {
    backgroundColor: '#101A31',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  roleBadgeText: { color: '#FF7622', fontSize: 11, fontWeight: '700' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#7E879B', fontSize: 12, marginTop: 2, fontWeight: '500' },
  addBtn: {
    backgroundColor: '#FF7622',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  categoryRow: { paddingHorizontal: 16, alignItems: 'center' },
  categoryChip: {
    backgroundColor: '#101A31',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  activeCategoryChip: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
  categoryChipText: { color: '#8D96AA', fontSize: 12, fontWeight: '600' },
  activeCategoryChipText: { color: '#FFF', fontWeight: '700' },

  listContainer: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 30 },
  card: {
    backgroundColor: '#0D162C',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#202D49',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  tableName: { color: '#FFF', fontSize: 16, fontWeight: '700', marginRight: 8 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  areaText: { color: '#7E879B', fontSize: 12, marginTop: 4 },
  seatsText: { color: '#35D49B', fontSize: 14, fontWeight: '700', marginTop: 4 },

  tapIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#101A31',
    borderWidth: 1,
    borderColor: '#202D49',
  },
  tapIndicatorText: { color: '#FF7622', fontSize: 11, fontWeight: '600' },

  sheetOptionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  editOptionBtn: {
    backgroundColor: 'rgba(53, 212, 155, 0.12)',
    borderColor: 'rgba(53, 212, 155, 0.3)',
  },
  editOptionText: { color: '#35D49B', fontWeight: '700', fontSize: 13 },
  toggleOptionBtn: {
    backgroundColor: 'rgba(245, 174, 34, 0.12)',
    borderColor: 'rgba(245, 174, 34, 0.3)',
  },
  toggleOptionText: { color: '#F5AE22', fontWeight: '700', fontSize: 13 },
  deleteOptionBtn: {
    backgroundColor: 'rgba(255, 82, 106, 0.12)',
    borderColor: 'rgba(255, 82, 106, 0.3)',
  },
  deleteOptionText: { color: '#FF526A', fontWeight: '700', fontSize: 13 },
  cancelSheetBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0D162C',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { color: '#7E879B', fontSize: 12, marginBottom: 16 },
  label: { color: '#8D96AA', fontSize: 12, marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#070E20',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#202D49',
    fontSize: 13,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: {
    backgroundColor: '#070E20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  activeChip: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
  chipText: { color: '#8D96AA', fontSize: 11 },
  activeChipText: { color: '#FFF', fontWeight: '700' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 22, alignItems: 'center' },
  cancelModalBtn: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  cancelText: { color: '#8D96AA', fontWeight: '600' },
  saveModalBtn: {
    backgroundColor: '#FF7622',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: { color: '#FFF', fontWeight: '700' },
});