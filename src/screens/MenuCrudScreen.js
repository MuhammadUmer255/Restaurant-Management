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

const INITIAL_MENU = [
  { id: '1', name: 'Truffle Wagyu Ribeye', price: '68.00', category: 'Main', inStock: true },
  { id: '2', name: 'Hokkaido Scallops Crudo', price: '39.25', category: 'Starters', inStock: true },
  { id: '3', name: 'Yuzu Basil Smash', price: '16.00', category: 'Beverages', inStock: false },
];

const CATEGORIES = ['Starters', 'Main', 'Beverages', 'Desserts'];

const MenuCrudScreen = ({ navigation }) => {
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main');
  const [inStock, setInStock] = useState(true);

  const openAddModal = () => {
    setEditingId(null);
    setDishName('');
    setPrice('');
    setCategory('Main');
    setInStock(true);
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setDishName(item.name);
    setPrice(item.price.toString().replace('$', ''));
    setCategory(item.category);
    setInStock(item.inStock);
    setModalVisible(true);
  };

  const handleSave = () => {
    const trimmedName = dishName.trim();
    const cleanPrice = price.toString().replace('$', '').trim();

    if (!trimmedName || !cleanPrice || isNaN(cleanPrice)) {
      Alert.alert('Error', 'Please enter a valid dish name and numeric price.');
      return;
    }

    if (editingId) {
      setMenu(menu.map(m => m.id === editingId ? { ...m, name: trimmedName, price: cleanPrice, category, inStock } : m));
    } else {
      const newItem = {
        id: Date.now().toString(),
        name: trimmedName,
        price: cleanPrice,
        category,
        inStock,
      };
      setMenu([...menu, newItem]);
    }
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Item', 'Are you sure you want to remove this menu item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setMenu(menu.filter(m => m.id !== id)) },
    ]);
  };

  const filteredMenu = menu.filter(item => {
    if (selectedCategoryFilter === 'All') return true;
    return item.category === selectedCategoryFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Add Dish</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterRow}>
        {['All', ...CATEGORIES].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, selectedCategoryFilter === cat && styles.activeFilterChip]}
            onPress={() => setSelectedCategoryFilter(cat)}
          >
            <Text style={[styles.filterChipText, selectedCategoryFilter === cat && styles.activeFilterChipText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredMenu.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.dishName}>{item.name}</Text>
                {!item.inStock && <Text style={styles.outOfStockBadge}>86 / Out of Stock</Text>}
              </View>
              <Text style={styles.categoryText}>{item.category}</Text>
              <Text style={styles.priceText}>${parseFloat(item.price).toFixed(2)}</Text>
            </View>

            <View style={styles.actionCol}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
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
              <Text style={styles.modalTitle}>{editingId ? 'Edit Dish' : 'Add New Dish'}</Text>

              <Text style={styles.label}>Dish / Drink Name</Text>
              <TextInput 
                style={styles.input} 
                value={dishName} 
                onChangeText={setDishName} 
                placeholder="e.g. Lobster Bisque" 
                placeholderTextColor="#666" 
              />

              <Text style={styles.label}>Price ($)</Text>
              <TextInput 
                style={styles.input} 
                value={price} 
                onChangeText={setPrice} 
                keyboardType="decimal-pad" 
                placeholder="24.50" 
                placeholderTextColor="#666" 
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity 
                    key={c} 
                    style={[styles.chip, category === c && styles.activeChip]} 
                    onPress={() => setCategory(c)}
                  >
                    <Text style={[styles.chipText, category === c && styles.activeChipText]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>In Stock / Available</Text>
                <Switch 
                  value={inStock} 
                  onValueChange={setInStock} 
                  trackColor={{ false: '#767577', true: 'rgba(255, 107, 0, 0.4)' }}
                  thumbColor={inStock ? '#FF6B00' : '#f4f3f4'} 
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
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10 },
  filterChip: { backgroundColor: '#161D2F', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  activeFilterChip: { backgroundColor: '#FF6B00' },
  filterChipText: { color: '#8A94A6', fontSize: 12 },
  activeFilterChipText: { color: '#FFF', fontWeight: 'bold' },
  listContainer: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: '#161D2F', padding: 14, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  dishName: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginRight: 8 },
  outOfStockBadge: { color: '#FF5252', fontSize: 10, backgroundColor: 'rgba(255, 82, 82, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  categoryText: { color: '#FF6B00', fontSize: 11, marginVertical: 2, fontWeight: '500' },
  priceText: { color: '#00E676', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6 },
  chip: { backgroundColor: '#0B101D', padding: 8, borderRadius: 6, marginRight: 6, marginBottom: 6, borderWidth: 1, borderColor: '#2A3447' },
  activeChip: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  chipText: { color: '#8A94A6', fontSize: 11 },
  activeChipText: { color: '#FFF', fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  cancelModalBtn: { padding: 10, marginRight: 10 },
  cancelText: { color: '#8A94A6' },
  saveModalBtn: { backgroundColor: '#FF6B00', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: '#FFF', fontWeight: 'bold' },
});

export default MenuCrudScreen;