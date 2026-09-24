import React, { useState, useMemo } from 'react';

import {

  View,

  Text,

  TouchableOpacity,

  StyleSheet,

  ScrollView,

  StatusBar,

  Modal,

  TextInput,

  TouchableWithoutFeedback,

} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import Ionicons from 'react-native-vector-icons/Ionicons';

import Toast from '../components/Toast';

import { useTheme } from '../context/ThemeContext';



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

  const { isDark, colors } = useTheme();

  const styles = useMemo(() => makeStyles(colors), [colors]);



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

      <StatusBar

        barStyle={isDark ? 'light-content' : 'dark-content'}

        backgroundColor={colors.bg}

        translucent={false}

      />



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

            <Ionicons name="restaurant-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />

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

                  <Ionicons name="people-outline" size={14} color={colors.muted} style={{ marginRight: 4 }} />

                  <Text style={styles.seatsText}>{table.seats} Seats</Text>

                </View>



                {/* Show Customer Info if Reserved by User */}

                {table.customer && table.status === 'Reserved' && (

                  <Text style={styles.reservedByText} numberOfLines={1}>

                    Booked by: {table.customer}

                  </Text>

                )}



                <View style={styles.actionTag}>

                  <Text style={[styles.actionTagText, !isAvailable && { color: colors.muted }]}>

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

                  placeholderTextColor={colors.muted}

                  value={guestName}

                  onChangeText={setGuestName}

                />



                <Text style={styles.label}>Reservation Time</Text>

                <TextInput

                  style={styles.input}

                  placeholder="e.g. 20:00 PM"

                  placeholderTextColor={colors.muted}

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

  const { colors } = useTheme();



  let background = 'rgba(53, 212, 155, 0.15)';

  let color = colors.success;



  if (status === 'Occupied') {

    background = 'rgba(255, 82, 106, 0.15)';

    color = colors.danger;

  } else if (status === 'Reserved') {

    background = 'rgba(245, 174, 34, 0.15)';

    color = colors.warning;

  }



  return (

    <View style={{ backgroundColor: background, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }}>

      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>● {status}</Text>

    </View>

  );

}



const makeStyles = (c) =>

  StyleSheet.create({

    container: { flex: 1, backgroundColor: c.bg },

    header: { paddingHorizontal: 20, paddingVertical: 14 },

    logo: { color: c.text, fontSize: 22, fontWeight: '800' },

    location: { color: c.muted, fontSize: 12, marginTop: 4 },



    floorTabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 },

    tab: { backgroundColor: c.chip, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 8 },

    activeTab: { backgroundColor: c.primary },

    tabText: { color: c.icon, fontSize: 13 },

    activeTabText: { color: '#FFFFFF', fontWeight: '700' },



    content: { padding: 16, paddingBottom: 40 },

    sectionTitle: { color: c.muted, fontSize: 13, fontWeight: '700', marginBottom: 12 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },



    // Table Card

    tableCard: {

      width: '48%',

      backgroundColor: c.card,

      borderRadius: 16,

      padding: 14,

      borderWidth: 1,

      borderColor: c.border,

      marginBottom: 12,

    },

    disabledCard: { opacity: 0.6 },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    tableNumber: { color: c.text, fontSize: 18, fontWeight: '800' },

    seatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },

    seatsText: { color: c.muted, fontSize: 12 },

    reservedByText: { color: c.warning, fontSize: 11, marginTop: 6, fontWeight: '600' },

    actionTag: { marginTop: 12 },

    actionTagText: { color: c.primary, fontSize: 11, fontWeight: '700' },



    // Modal Styles

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },

    modalContent: { backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 20 },

    modalHeader: { marginBottom: 10 },

    modalTitle: { color: c.text, fontSize: 20, fontWeight: '800' },

    modalSubtitle: { color: c.muted, fontSize: 12, marginTop: 4 },

    divider: { height: 1, backgroundColor: c.border, marginVertical: 14 },



    label: { color: c.icon, fontSize: 12, fontWeight: '700', marginBottom: 6 },

    input: {

      backgroundColor: c.chip,

      borderWidth: 1,

      borderColor: c.border,

      borderRadius: 10,

      paddingHorizontal: 12,

      paddingVertical: 10,

      color: c.text,

      fontSize: 14,

      marginBottom: 14,

    },



    bookButton: {

      backgroundColor: c.primary,

      borderRadius: 12,

      paddingVertical: 12,

      alignItems: 'center',

      marginTop: 8,

    },

    bookButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

    cancelBtn: { alignItems: 'center', marginTop: 12, paddingVertical: 6 },

    cancelText: { color: c.muted, fontSize: 13, fontWeight: '600' },

  }); 