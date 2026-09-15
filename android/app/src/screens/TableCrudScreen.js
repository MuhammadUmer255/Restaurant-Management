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
    Alert,
} from 'react-native';

const INITIAL_TABLES = [
    { id: '1', number: 'T-01', seats: 2, zone: 'Indoor Main', status: 'Available' },
    { id: '2', number: 'T-02', seats: 4, zone: 'Indoor Main', status: 'Occupied' },
    { id: '3', number: 'VIP-1', seats: 8, zone: 'Terrace', status: 'Reserved' },
];

const TableCrudScreen = ({ navigation }) => {
    const [tables, setTables] = useState(INITIAL_TABLES);
    const [modalVisible, setModalVisible] = useState(false);
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
        if (!tableNum.trim()) {
            Alert.alert('Error', 'Please enter table number.');
            return;
        }

        if (editingId) {
            setTables(tables.map(t => t.id === editingId ? { ...t, number: tableNum, seats: parseInt(seats) || 2, zone, status } : t));
        } else {
            const newTable = {
                id: Date.now().toString(),
                number: tableNum,
                seats: parseInt(seats) || 2,
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
            { text: 'Delete', style: 'destructive', onPress: () => setTables(tables.filter(t => t.id !== id)) },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Table Layout Management</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
                    <Text style={styles.addBtnText}>+ Add Table</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.gridContainer}>
                {tables.map(t => (
                    <View key={t.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.tableName}>{t.number}</Text>
                            <Text style={styles.seatsBadge}>{t.seats} Seats</Text>
                        </View>
                        <Text style={styles.zoneText}>Zone: {t.zone}</Text>
                        <Text style={[styles.statusText, { color: t.status === 'Available' ? '#00E676' : t.status === 'Occupied' ? '#FF5252' : '#FF6B00' }]}>
                            ● {t.status}
                        </Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(t)}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(t.id)}>
                                <Text style={styles.deleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Add / Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit Table' : 'Add New Table'}</Text>

                        <Text style={styles.label}>Table Number / Code</Text>
                        <TextInput style={styles.input} value={tableNum} onChangeText={setTableNum} placeholder="e.g. T-15 or VIP-2" placeholderTextColor="#666" />

                        <Text style={styles.label}>Seat Capacity</Text>
                        <TextInput style={styles.input} value={seats} onChangeText={setSeats} keyboardType="numeric" placeholder="4" placeholderTextColor="#666" />

                        <Text style={styles.label}>Zone Area</Text>
                        <View style={styles.chipRow}>
                            {['Indoor Main', 'Terrace', 'VIP Lounge'].map(z => (
                                <TouchableOpacity key={z} style={[styles.chip, zone === z && styles.activeChip]} onPress={() => setZone(z)}>
                                    <Text style={[styles.chipText, zone === z && styles.activeChipText]}>{z}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Initial Status</Text>
                        <View style={styles.chipRow}>
                            {['Available', 'Occupied', 'Reserved'].map(s => (
                                <TouchableOpacity key={s} style={[styles.chip, status === s && styles.activeChip]} onPress={() => setStatus(s)}>
                                    <Text style={[styles.chipText, status === s && styles.activeChipText]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
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
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B101D' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    backBtn: { padding: 4 },
    backText: { color: '#FF6B00', fontSize: 16 },
    title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    addBtn: { backgroundColor: '#FF6B00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    addBtnText: { color: '#FFF', fontWeight: 'bold' },
    gridContainer: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { backgroundColor: '#161D2F', width: '48%', padding: 14, borderRadius: 10, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tableName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    seatsBadge: { color: '#8A94A6', fontSize: 10, backgroundColor: '#0B101D', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    zoneText: { color: '#8A94A6', fontSize: 11, marginTop: 6 },
    statusText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    editBtn: { backgroundColor: '#1E2638', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    editText: { color: '#00E676', fontSize: 11 },
    deleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
    deleteText: { color: '#FF5252', fontSize: 11 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#161D2F', padding: 20, borderRadius: 12 },
    modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    label: { color: '#8A94A6', fontSize: 12, marginTop: 10, marginBottom: 4 },
    input: { backgroundColor: '#0B101D', color: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2A3447' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6 },
    chip: { backgroundColor: '#0B101D', padding: 8, borderRadius: 6, marginRight: 6, marginBottom: 6 },
    activeChip: { backgroundColor: '#FF6B00' },
    chipText: { color: '#8A94A6', fontSize: 11 },
    activeChipText: { color: '#FFF' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
    cancelModalBtn: { padding: 10, marginRight: 10 },
    cancelText: { color: '#8A94A6' },
    saveModalBtn: { backgroundColor: '#FF6B00', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    saveText: { color: '#FFF', fontWeight: 'bold' },
});

export default TableCrudScreen;