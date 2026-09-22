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
  const currentRole = route?.params?.role || authContext?.userRole || 'admin';
  const isAdmin = currentRole === 'admin';

  const [menuItems, setMenuItems] = useState(INITIAL_MENU);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Selected item state for Context Actions
  const [selectedItem, setSelectedItem] = useState(null);

  // Modal Visibility States
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); // 'EDIT' or 'ADD'

  // Form Input States
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState('Mains');
  const [price, setPrice] = useState('');

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

  // Filtering
  const filteredMenu = menuItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  // 1. Tapping an Item / Card
  const handleItemPress = (item) => {
    if (!isAdmin) return;
    setSelectedItem(item);
    setActionMenuVisible(true);
  };

  // 2. Tapping Header "+ Add Dish"
  const openAddModal = () => {
    setSelectedItem(null);
    setCurrentAction('ADD');
    setDishName('');
    setCategory('Mains');
    setPrice('');
    setFormModalVisible(true);
  };

  // 3. User selects Action from Context Sheet
  const handleSelectAction = (action) => {
    setActionMenuVisible(false);

    if (action === 'DELETE') {
      setDeleteConfirmVisible(true);
      return;
    }

    if (action === 'TOGGLE') {
      if (selectedItem) {
        toggleAvailability(selectedItem.id);
      }
      return;
    }

    setCurrentAction(action);

    if (action === 'EDIT' && selectedItem) {
      setDishName(selectedItem.name);
      setCategory(selectedItem.category);
      setPrice(selectedItem.price.toString());
    } else {
      setDishName('');
      setCategory('Mains');
      setPrice('');
    }

    setFormModalVisible(true);
  };

  // Confirm Delete Handler
  const confirmDeleteDish = () => {
    if (selectedItem) {
      const name = selectedItem.name;
      setMenuItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setDeleteConfirmVisible(false);
      setSelectedItem(null);
      showToast(`"${name}" removed from the menu!`, 'error');
    }
  };

  // 4. Save handler for Form Modal
  const handleSaveItem = () => {
    if (!dishName.trim() || !price.trim()) {
      showToast('Please enter dish name and price.', 'error');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('Please enter a valid price.', 'error');
      return;
    }

    if (currentAction === 'EDIT' && selectedItem) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, name: dishName, category, price: parsedPrice }
            : item
        )
      );
      showToast(`"${dishName}" updated successfully!`, 'success');
    } else {
      const newItem = {
        id: Date.now().toString(),
        name: dishName,
        category,
        price: parsedPrice,
        available: true,
      };
      setMenuItems((prev) => [newItem, ...prev]);
      showToast(`"${dishName}" added to the menu!`, 'success');
    }

    setFormModalVisible(false);
    setSelectedItem(null);
  };

  const toggleAvailability = (id) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.available;
          showToast(
            `"${item.name}" marked as ${nextState ? 'Available' : 'Sold Out'}`,
            nextState ? 'success' : 'error'
          );
          return { ...item, available: nextState };
        }
        return item;
      })
    );
  };

  const handleAddToCart = (item) => {
    showToast(`Added "${item.name}" to cart!`, 'success');
  };

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
          <TouchableOpacity
            style={styles.card}
            activeOpacity={isAdmin ? 0.7 : 1}
            onPress={() => handleItemPress(item)}
          >
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

            {/* Actions / Status Right Edge Indicator */}
            {isAdmin ? (
              <View style={styles.tapIndicator}>
                <Text style={styles.tapIndicatorText}>Manage ›</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addCartBtn, !item.available && styles.disabledCartBtn]}
                disabled={!item.available}
                onPress={() => handleAddToCart(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.addCartText, !item.available && styles.disabledCartText]}>
                  {item.available ? '+ Order' : 'Unavailable'}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />

      {/* STEP 1: Context Action Menu Sheet (Modal) */}
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
                  {selectedItem?.name || 'Item Options'}
                </Text>
                <Text style={styles.modalSubtitle}>Select an action to perform:</Text>

                <TouchableOpacity
                  style={[styles.sheetOptionBtn, styles.editOptionBtn]}
                  onPress={() => handleSelectAction('EDIT')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editOptionText}>Edit Dish Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sheetOptionBtn, styles.toggleOptionBtn]}
                  onPress={() => handleSelectAction('TOGGLE')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toggleOptionText}>
                    {selectedItem?.available ? 'Mark as Sold Out' : 'Mark as Available'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sheetOptionBtn, styles.deleteOptionBtn]}
                  onPress={() => handleSelectAction('DELETE')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteOptionText}>Delete Dish</Text>
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
                <Text style={styles.modalTitle}>Delete Dish</Text>
                <Text style={styles.modalSubtitle}>
                  Are you sure you want to remove "{selectedItem?.name}" from the menu?
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
                    onPress={confirmDeleteDish}
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

      {/* STEP 3: Detail Form Modal */}
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
                  {currentAction === 'EDIT' ? 'Edit Dish' : 'Add New Dish'}
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
                    onPress={() => setFormModalVisible(false)}
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

  // Admin Manage Indicator Right Side
  tapIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#101A31',
    borderWidth: 1,
    borderColor: '#202D49',
  },
  tapIndicatorText: { color: '#FF7622', fontSize: 11, fontWeight: '600' },

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

  // Context Sheet Option Buttons
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