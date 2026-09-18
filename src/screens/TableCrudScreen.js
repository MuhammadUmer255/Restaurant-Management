import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INITIAL_TABLES = [
  { id: '1', number: 'T-01', seats: 2, zone: 'Indoor Main', status: 'Available' },
  { id: '2', number: 'T-02', seats: 4, zone: 'Indoor Main', status: 'Occupied' },
  { id: '3', number: 'VIP-1', seats: 8, zone: 'Terrace', status: 'Reserved' },
];

const ZONES = ['Indoor Main', 'Terrace', 'VIP Lounge'];
const STATUSES = ['Available', 'Occupied', 'Reserved'];

const TableCrudScreen = ({ navigation }) => {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [tableNum, setTableNum] = useState('');
  const [seats, setSeats] = useState('4');
  const [zone, setZone] = useState('Indoor Main');
  const [status, setStatus] = useState('Available');

  const openAddModal = () => {
    setEditingId(null);
    setTableNum('');
    setSeats('4');
    setZone('Indoor Main');
    setStatus('Available');
    setModalVisible(true);
  };

  const openEditModal = (table) => {
    setEditingId(table.id);
    setTableNum(table.number);
    setSeats(table.seats.toString());
    setZone(table.zone);
    setStatus(table.status);
    setModalVisible(true);
  };

  const handleSave = () => {
    const trimmedNum = tableNum.trim();
    const parsedSeats = parseInt(seats, 10);

    if (!trimmedNum) {
      Alert.alert('Validation Error', 'Please enter a valid table number.');
      return;
    }

    if (isNaN(parsedSeats) || parsedSeats <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid seat capacity.');
      return;
    }

    if (editingId) {
      setTables(
        tables.map((t) =>
          t.id === editingId
            ? { ...t, number: trimmedNum, seats: parsedSeats, zone, status }
            : t
        )
      );
    } else {
      const newTable = {
        id: Date.now().toString(),
        number: trimmedNum,
        seats: parsedSeats,
        zone,
        status,
      };
      setTables([...tables, newTable]);
    }
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Table', 'Are you sure you want to remove this table?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setTables(tables.filter((t) => t.id !== id)),
      },
    ]);
  };

  const filteredTables = tables.filter((t) => {
    if (selectedZoneFilter === 'All') return true;
    return t.zone === selectedZoneFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#070E20" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1}>
            Table Management
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add Table</Text>
        </TouchableOpacity>
      </View>

      {/* Zone Filter Chips */}
      <View style={{ height: 40, marginBottom: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {['All', ...ZONES].map((z) => (
            <TouchableOpacity
              key={z}
              style={[
                styles.filterChip,
                selectedZoneFilter === z && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedZoneFilter(z)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedZoneFilter === z && styles.activeFilterChipText,
                ]}
              >
                {z}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Grid Layout using FlatList */}
      <FlatList
        data={filteredTables}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: t }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.tableName} numberOfLines={1}>
                {t.number}
              </Text>
              <View style={styles.seatsBadge}>
                <Text style={styles.seatsBadgeText}>{t.seats} Seats</Text>
              </View>
            </View>

            <Text style={styles.zoneText} numberOfLines={1}>
              Zone: {t.zone}
            </Text>

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    t.status === 'Available'
                      ? '#35D49B'
                      : t.status === 'Occupied'
                        ? '#FF526A'
                        : '#F5AE22',
                },
              ]}
            >
              ● {t.status}
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditModal(t)}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(t.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Table' : 'Add New Table'}
              </Text>

              <Text style={styles.label}>Table Number / Code</Text>
              <TextInput
                style={styles.input}
                value={tableNum}
                onChangeText={setTableNum}
                placeholder="e.g. T-15 or VIP-2"
                placeholderTextColor="#778197"
              />

              <Text style={styles.label}>Seat Capacity</Text>
              <TextInput
                style={styles.input}
                value={seats}
                onChangeText={setSeats}
                keyboardType="numeric"
                placeholder="4"
                placeholderTextColor="#778197"
              />

              <Text style={styles.label}>Zone Area</Text>
              <View style={styles.chipRow}>
                {ZONES.map((z) => (
                  <TouchableOpacity
                    key={z}
                    style={[styles.chip, zone === z && styles.activeChip]}
                    onPress={() => setZone(z)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, zone === z && styles.activeChipText]}>
                      {z}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Initial Status</Text>
              <View style={styles.chipRow}>
                {STATUSES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, status === s && styles.activeChip]}
                    onPress={() => setStatus(s)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, status === s && styles.activeChipText]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveModalBtn}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
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
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#131D35',
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backText: { color: '#FF7622', fontSize: 16, fontWeight: '600' },
  titleWrapper: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  title: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  addBtn: { backgroundColor: '#FF7622', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  // Zone Filters Bar
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

  // Table Grid View
  gridContainer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 },
  columnWrapper: { justifyContent: 'space-between' },
  card: {
    backgroundColor: '#0D162C',
    width: '48%',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tableName: { color: '#FFF', fontSize: 16, fontWeight: '700', flex: 1, marginRight: 4 },
  seatsBadge: {
    backgroundColor: '#070E20',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  seatsBadgeText: { color: '#8D96AA', fontSize: 10, fontWeight: '600' },
  zoneText: { color: '#7E879B', fontSize: 11, marginTop: 8 },
  statusText: { fontSize: 12, fontWeight: '700', marginTop: 4 },

  // Action Buttons
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, alignItems: 'center' },
  editBtn: {
    backgroundColor: 'rgba(53, 212, 155, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(53, 212, 155, 0.3)',
  },
  editText: { color: '#35D49B', fontSize: 11, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: 'rgba(255, 82, 106, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 106, 0.3)',
  },
  deleteText: { color: '#FF526A', fontSize: 11, fontWeight: '700' },

  // Modal Dialog UI
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#0D162C', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#202D49' },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 14 },
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
  saveModalBtn: { backgroundColor: '#FF7622', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: '#FFF', fontWeight: '700' },
});

export default TableCrudScreen;