import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from '../components/Toast'; // Aapka Toast component

const INITIAL_TABLES = [
  { id: 'T-01', seats: 2, status: 'Available', zone: 'Indoor Main' },
  { id: 'T-02', seats: 4, status: 'Occupied', zone: 'Indoor Main' },
  { id: 'T-03', seats: 6, status: 'Reserved', customer: 'Dr. Raymond', time: '19:30', zone: 'Terrace' },
  { id: 'T-04', seats: 2, status: 'Occupied', zone: 'Indoor Main' },
  { id: 'T-05', seats: 4, status: 'Available', zone: 'Terrace' },
  { id: 'VIP-1', seats: 8, status: 'Available', zone: 'Terrace' },
];

const ZONES = ['All', 'Indoor Main', 'Terrace'];

export default function TablesScreen() {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Booking Form State
  const [guestName, setGuestName] = useState('');
  const [bookingTime, setBookingTime] = useState('20:00');

  // Toast Notification State
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

  const filteredTables = tables.filter(
    (table) => selectedZone === 'All' || table.zone === selectedZone
  );

  // Table Card Tap Handler
  const handleTablePress = (table) => {
    if (table.status !== 'Available') {
      showToast(`Table ${table.id} is already ${table.status.toLowerCase()}!`, 'error');
      return;
    }
    setSelectedTable(table);
    setGuestName('');
    setModalVisible(true);
  };

  // Confirm Table Booking Action
  const handleConfirmBooking = () => {
    if (!guestName.trim()) {
      showToast('Please enter your name for reservation.', 'error');
      return;
    }

    // State update: Change table status to Reserved
    setTables((prevTables) =>
      prevTables.map((t) =>
        t.id === selectedTable.id
          ? {
              ...t,
              status: 'Reserved',
              customer: guestName,
              time: bookingTime,
            }
          : t
      )
    );

    setModalVisible(false);
    showToast(`Table ${selectedTable.id} booked successfully for ${guestName}!`, 'success');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#070E20" translucent={false} />

      {/* Floating Toast */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onDismiss={hideToast}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="restaurant-outline" size={18} color="#FF7622" style={{ marginRight: 6 }} />
            <Text style={styles.logo}>GourmetOS</Text>
          </View>
          <Text style={styles.location}>Select an available table to book</Text>
        </View>
      </View>

      {/* Zone Filters */}
      <View style={styles.floorTabs}>
        {ZONES.map((zone) => (
          <TouchableOpacity
            key={zone}
            style={[styles.tab, selectedZone === zone && styles.activeTab]}
            onPress={() => setSelectedZone(zone)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedZone === zone && styles.activeTabText]}>
              {zone}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tables Grid View */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Floor Layout</Text>

        <View style={styles.grid}>
          {filteredTables.map((table) => {
            const isAvailable = table.status === 'Available';

            return (
              <TouchableOpacity
                key={table.id}
                style={[
                  styles.tableCard,
                  !isAvailable && styles.disabledCard,
                ]}
                onPress={() => handleTablePress(table)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.tableNumber}>{table.id}</Text>
                  <StatusBadge status={table.status} />
                </View>

                <View style={styles.seatsRow}>
                  <Ionicons name="people-outline" size={14} color="#858FA5" style={{ marginRight: 4 }} />
                  <Text style={styles.seatsText}>{table.seats} Seats</Text>
                </View>

                {/* Show Customer Info if Reserved by User */}
                {table.customer && table.status === 'Reserved' && (
                  <Text style={styles.reservedByText} numberOfLines={1}>
                    Booked by: {table.customer}
                  </Text>
                )}

                <View style={styles.actionTag}>
                  <Text style={[styles.actionTagText, !isAvailable && { color: '#7D879D' }]}>
                    {isAvailable ? 'Book Table ›' : 'Unavailable'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Booking Form Modal */}
      {selectedTable && (
        <Modal
          visible={modalVisible}
          animationType="slide"
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
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Book Table {selectedTable.id}</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedTable.seats} Seats Capacity • {selectedTable.zone}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* Reservation Input Fields */}
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#5C667A"
                  value={guestName}
                  onChangeText={setGuestName}
                />

                <Text style={styles.label}>Reservation Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 20:00 PM"
                  placeholderTextColor="#5C667A"
                  value={bookingTime}
                  onChangeText={setBookingTime}
                />

                {/* Actions */}
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={handleConfirmBooking}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bookButtonText}>Confirm Reservation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  let background = '#12382E';
  let color = '#35D49B';

  if (status === 'Occupied') {
    background = '#3A1822';
    color = '#FF526A';
  } else if (status === 'Reserved') {
    background = '#3B2D12';
    color = '#F5AE22';
  }

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>● {status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070E20' },
  header: { paddingHorizontal: 20, paddingVertical: 14 },
  logo: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  location: { color: '#7D879D', fontSize: 12, marginTop: 4 },

  floorTabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 },
  tab: { backgroundColor: '#101A31', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 8 },
  activeTab: { backgroundColor: '#FF7622' },
  tabText: { color: '#8D96AA', fontSize: 13 },
  activeTabText: { color: '#FFFFFF', fontWeight: '700' },

  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: '#7D879D', fontSize: 13, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  // Table Card
  tableCard: {
    width: '48%',
    backgroundColor: '#0D162C',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#202D49',
    marginBottom: 12,
  },
  disabledCard: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tableNumber: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  badge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  seatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  seatsText: { color: '#858FA5', fontSize: 12 },
  reservedByText: { color: '#F5AE22', fontSize: 11, marginTop: 6, fontWeight: '600' },
  actionTag: { marginTop: 12 },
  actionTagText: { color: '#FF7622', fontSize: 11, fontWeight: '700' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#0D162C', borderRadius: 18, borderWidth: 1, borderColor: '#25334F', padding: 20 },
  modalHeader: { marginBottom: 10 },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  modalSubtitle: { color: '#7F899F', fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#202D49', marginVertical: 14 },

  label: { color: '#8D96AA', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: {
    backgroundColor: '#101A31',
    borderWidth: 1,
    borderColor: '#202D49',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 14,
  },

  bookButton: {
    backgroundColor: '#FF7622',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  bookButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  cancelBtn: { alignItems: 'center', marginTop: 12, paddingVertical: 6 },
  cancelText: { color: '#7D879D', fontSize: 13, fontWeight: '600' },
});