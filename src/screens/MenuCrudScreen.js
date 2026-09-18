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
import { useAuth } from '../context/AuthContext';

const INITIAL_MENU = [
  { id: '1', name: 'Truffle Wagyu Ribeye', category: 'Mains', price: 68.0, available: true },
  { id: '2', name: 'Yuzu Basil Smash', category: 'Beverages', price: 28.0, available: true },
  { id: '3', name: 'Hokkaido Scallops Crudo', category: 'Starters', price: 39.25, available: true },
  { id: '4', name: 'Valrhona Chocolate Soufflé', category: 'Desserts', price: 24.0, available: false },
];

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages'];

export default function MenuCrudScreen({ route, navigation }) {
  // Role Detection (Supports both Route params & AuthContext)
  const authContext = useAuth ? useAuth() : {};
  const currentRole = route?.params?.role || authContext?.userRole || 'user';
  const isAdmin = currentRole === 'admin';

  const [menuItems, setMenuItems] = useState(INITIAL_MENU);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State for Admin CRUD
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState('Mains');
  const [price, setPrice] = useState('');

  // Filtering
  const filteredMenu = menuItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  // Modal Handlers for Admin
  const openAddModal = () => {
    setEditingId(null);
    setDishName('');
    setCategory('Mains');
    setPrice('');
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setDishName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setModalVisible(true);
  };

  const handleSaveItem = () => {
    if (!dishName.trim() || !price.trim()) {
      Alert.alert('Validation Error', 'Please enter dish name and price.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return;
    }

    if (editingId) {
      setMenuItems(
        menuItems.map((item) =>
          item.id === editingId
            ? { ...item, name: dishName, category, price: parsedPrice }
            : item
        )
      );
    } else {
      const newItem = {
        id: Date.now().toString(),
        name: dishName,
        category,
        price: parsedPrice,
        available: true,
      };
      setMenuItems([...menuItems, newItem]);
    }

    setModalVisible(false);
  };

  const handleDeleteItem = (id) => {
    Alert.alert('Delete Dish', 'Are you sure you want to remove this item from the menu?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setMenuItems(menuItems.filter((i) => i.id !== id)),
      },
    ]);
  };

  const toggleAvailability = (id) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#070E20" translucent={false} />

      {/* Modern Top Navigation Bar */}
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
            {isAdmin ? '⚡ Admin Mode' : '👤 Customer View'}
          </Text>
        </View>
      </View>

      {/* Main Screen Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            Restaurant Menu
          </Text>
          <Text style={styles.subtitle}>
            {filteredMenu.length} items available
          </Text>
        </View>

        {/* Admin Action: Add Button */}
        {isAdmin && (
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={openAddModal}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ Add Dish</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Horizontal Filter Chips */}
      <View style={{ height: 42, marginBottom: 8 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.activeCategoryChip,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.activeCategoryChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu List */}
      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={styles.nameRow}>
                <Text style={styles.dishName} numberOfLines={1}>
                  {item.name}
                </Text>
                {!item.available && (
                  <View style={styles.outBadge}>
                    <Text style={styles.outBadgeText}>Sold Out</Text>
                  </View>
                )}
              </View>
              <Text style={styles.categoryText}>{item.category}</Text>
              <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
            </View>

            {/* Actions Column */}
            {isAdmin ? (
              <View style={styles.adminActionCol}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => openEditModal(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toggleBtn}
                  onPress={() => toggleAvailability(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toggleText, !item.available && { color: '#35D49B' }]}>
                    {item.available ? 'Disable' : 'Enable'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteItem(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addCartBtn, !item.available && styles.disabledCartBtn]}
                disabled={!item.available}
                activeOpacity={0.8}
              >
                <Text style={[styles.addCartText, !item.available && styles.disabledCartText]}>
                  {item.available ? '+ Order' : 'Unavailable'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Admin Add/Edit Modal */}
      {isAdmin && (
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
                  {editingId ? 'Edit Dish' : 'Add New Dish'}
                </Text>

                <Text style={styles.label}>Dish Name</Text>
                <TextInput
                  style={styles.input}
                  value={dishName}
                  onChangeText={setDishName}
                  placeholder="e.g. Wagyu Steak"
                  placeholderTextColor="#778197"
                />

                <Text style={styles.label}>Price ($)</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="29.99"
                  placeholderTextColor="#778197"
                />

                <Text style={styles.label}>Category</Text>
                <View style={styles.chipRow}>
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.chip,
                        category === c && styles.activeChip,
                      ]}
                      onPress={() => setCategory(c)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          category === c && styles.activeChipText,
                        ]}
                      >
                        {c}
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
                    onPress={handleSaveItem}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveText}>Save Dish</Text>
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
  
  // Navigation & Header Styling
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

  // Horizontal Scroll Filter
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

  // Menu List Cards
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
  dishName: { color: '#FFF', fontSize: 15, fontWeight: '700', marginRight: 6 },
  outBadge: {
    backgroundColor: 'rgba(255, 82, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 106, 0.3)',
  },
  outBadgeText: { color: '#FF526A', fontSize: 10, fontWeight: '700' },
  categoryText: { color: '#7E879B', fontSize: 12, marginTop: 3 },
  priceText: { color: '#35D49B', fontSize: 16, fontWeight: '700', marginTop: 4 },

  // Admin Actions Column
  adminActionCol: { alignItems: 'flex-end' },
  editBtn: {
    backgroundColor: 'rgba(53, 212, 155, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(53, 212, 155, 0.3)',
    marginBottom: 4,
  },
  editText: { color: '#35D49B', fontSize: 11, fontWeight: '700' },
  toggleBtn: { paddingHorizontal: 6, paddingVertical: 3, marginBottom: 2 },
  toggleText: { color: '#F5AE22', fontSize: 11, fontWeight: '600' },
  deleteBtn: { paddingHorizontal: 6, paddingVertical: 3 },
  deleteText: { color: '#FF526A', fontSize: 11, fontWeight: '600' },

  // User Cart Button
  addCartBtn: {
    backgroundColor: '#FF7622',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  disabledCartBtn: { backgroundColor: '#101A31', borderWidth: 1, borderColor: '#202D49' },
  addCartText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  disabledCartText: { color: '#7E879B' },

  // Modal Dialog Styling
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
  saveModalBtn: {
    backgroundColor: '#FF7622',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: { color: '#FFF', fontWeight: '700' },
});